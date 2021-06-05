import url from 'url'
import querystring from 'querystring'
import axios from 'axios'
import to from 'await-to-js'
import { isObject } from "lodash"
import { WebClient, WebAPICallError, ChatGetPermalinkArguments} from "@slack/web-api"

import { NOT_YET, ACTIVATION_QUORUM, INPUT_NAME_PASSWORD } from '../models'
import { getVoiceArg } from './argument-voice'
import { getReplyArg } from './argument-reply'
import { getConfigMsgArg, getHelpMessageArg, getAlreadyAgreedMessageArg } from './argument-config'
import { createLogger } from '../utils'
import { IVoice, isVoice } from '../types/type-voice'
import { IReply } from '../types/type-reply'
import { putReply, getReply, deleteReply } from '../models/model-reply'
import { hashAndtoggle, sha256Hash, getMSFromHours} from '../utils/common.util'
import { IGroup } from '../types/type-group'
import { getSlackATArrByTeamId, deleteSlackAT } from '../models/model-slackAT'
import { putVoice, getVoice, deleteVoice } from '../models/model-voice'
import { putGroup, getGroup, updateBatchGroup, getGroupKeysArrByAccessToken } from '../models/model-group'
import { getGroupId, getVoiceId, getReplyId, IMyBlockActionPayload, IMyViewSubmissionPayload, isMyViewSubmissionPayload } from '../models/model-common'
import { IPMDeletionView, IChatGetPermalinkResponse, IPMDeactivateWarningView} from '../types/type-common'
import { getDeletionViewOpenArg, getAppDeactivateWarningViewsArg, getDeactivatedArg, getActivatedArg } from './argument-common'
import { isReplyByTsThreadTs, checkAndConvertUrlTsToDotTs } from '../utils/common.util'
import { isNotEmptyString } from '../utils/typecheck.util'

const logger = createLogger('core')

export const reportVoiceOrReply = async (web: WebClient, payload: IMyBlockActionPayload) => {
  const { team, channel, message, user, response_url } = payload
  const ts = message.ts
  const threadTs = message.thread_ts || ts
  const isReply = isReplyByTsThreadTs(ts, threadTs)

  const groupId = getGroupId(channel.id, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, threadTs)
  const replyId = getReplyId(voiceId, ts)
  const group = await getGroup(channel.id)

  const voiceOrReply = isReply ? await getReply(replyId) : await getVoice(voiceId)
  const userReportArr = hashAndtoggle(voiceOrReply.userReportArr, user.id, isReply ? replyId : voiceId)
  // 콘셉: 한번 isHiddenByReport: true 된 경우 번복되지 않음.
  const isHiddenByReport = voiceOrReply.isHiddenByReport || userReportArr.length >= (group.numberOfReportToHidden || 1)
  // 신고 개수 상승으로 hidden 처리가 될 수 있으므로 updateVoice 에서 반환된 voice를 사용
  const tmp: IVoice | IReply = { ...voiceOrReply, userReportArr, isHiddenByReport }
  const updated: IVoice | IReply = isVoice(tmp) ? await putVoice(tmp) : await putReply(tmp)
  const arg = isVoice(updated) ? getVoiceArg(updated) : getReplyArg(updated)
  await axios.post(response_url, { ...arg, ts})
}

export const postAgreementMesssage = async (web: WebClient, group: IGroup) => {
  const [err, result] = await to(web.chat.postMessage(getConfigMsgArg(group)))
  if (err || !isObject(result) || typeof result.ts !== 'string') throw err || new Error('Wrong result.ts')
  logger.debug(`* postAgreementMesssage. ts - ${result.ts}` )

  const [err2, result2] = await to(web.chat.getPermalink({ message_ts: result.ts, channel: group.channelId }))
  if (err2 || !isObject(result2) || typeof result2.permalink !== 'string') throw err2 || new Error('Wrong result.permalink')
  logger.debug(`* postAgreementMesssage. permalink - ${result2.permalink}` )

  const newGroup: IGroup = { ...group, activationMsgTs: result.ts }
  await putGroup(newGroup)
}

export const sendHelpMessage = async (web: WebClient, group: IGroup, user: string, configMsgPermalink: string) => {
  const helpArg = getHelpMessageArg(group.channelId, user, configMsgPermalink, group.isPostingAvailable)
  await web.chat.postEphemeral(helpArg)
}

const getWATETByChanging = (newValue: boolean, oldValue: boolean, currentTime: number) => {
  // isPostingAvailable이 false에서 true가 되었을때, 만료시간을 하루 뒤로 셋팅
  // isPostingAvailable이 true에서 false가 되었을때, 만료시간을 -1로 셋팅
  return (
      (newValue && !oldValue) ? Date.now() + getMSFromHours(24)
    : (!newValue && oldValue) ? -1
    : currentTime
  )
}

export const agreeAppActivation = async (web: WebClient, group: IGroup, userId: string, responseUrl: string) => {
  const hashedUserId = sha256Hash(userId, group.channelId)
  if (group.agreedUserArr.indexOf(hashedUserId) > -1) {
    const alreadyArg = getAlreadyAgreedMessageArg(group.channelId, userId)
    return await to(web.chat.postEphemeral(alreadyArg))
  }

  // force agreement 가 있으므로, ACTIVATION_QUORUM 을 넘지 않는
  // isPostingAvailable: true 가 있을 수 있는데 이 경우 false 로 변경하면 안됨
  const agreedUserArr = [...group.agreedUserArr, hashedUserId]
  const isPostingAvailable = group.forceActivateUserId !== NOT_YET ? true : agreedUserArr.length >= ACTIVATION_QUORUM
  const webAccessTokenExpirationTime = getWATETByChanging(isPostingAvailable, group.isPostingAvailable, group.webAccessTokenExpirationTime)

  const updatedGroup = await putGroup({ ...group, agreedUserArr, isPostingAvailable, webAccessTokenExpirationTime })
  await axios.post(responseUrl, getConfigMsgArg(updatedGroup))
}

export const forceAppActivate = async (web: WebClient, group: IGroup, forceActivateUserId: string, responseUrl: string) => {
  const webAccessTokenExpirationTime = getWATETByChanging(true, false, group.webAccessTokenExpirationTime)
  const updatedGroup = await putGroup({
    ...group,
    isPostingAvailable: true, webAccessTokenExpirationTime,
    forceActivateUserId, forceDeactivateUserId: NOT_YET,
  })
  const [err, result] = await to(axios.post(responseUrl, getConfigMsgArg(updatedGroup)))
  if (err || !isObject(result)) throw err || new Error('Failed to update config message')

  const permalink = await getConfigMsgPermalink(web, group)
  if (!permalink) throw new Error('No permalink')
  await web.chat.postMessage(getActivatedArg(group.channelId, forceActivateUserId, permalink))
}

export const forceAppDeactivate = async (web: WebClient, group: IGroup, userId: string) => {
  const { channelId, agreedUserArr } = group
  const webAccessTokenExpirationTime = getWATETByChanging(false, true, group.webAccessTokenExpirationTime)
  const updatedGroup: IGroup = {
    ...group, agreedUserArr: [],
    isPostingAvailable: false, webAccessTokenExpirationTime,
    forceDeactivateUserId: userId, forceActivateUserId: NOT_YET,
  }
  const updatedConfigMsgArg = { ...getConfigMsgArg(updatedGroup), ts: group.activationMsgTs }
  const permalink = await getConfigMsgPermalink(web, group)
  if (!permalink) throw new Error('Can not get config msg permalink in forceAppDeactivate()')

  // TODO: 아래 3개의 작업이 원자성을 가져야 한다.
  await web.chat.postMessage(getDeactivatedArg(channelId, userId, agreedUserArr.length, permalink))
  await web.chat.update(updatedConfigMsgArg)
  await putGroup(updatedGroup)
}

export const showDeactivateWarning = async (web: WebClient, triggerId: string, group: IGroup) => {
  const { channelId, channelName} = group
  const pm: IPMDeactivateWarningView = { channelId, channelName }
  const arg = getAppDeactivateWarningViewsArg(triggerId, group.agreedUserArr.length, pm)
  await web.views.open(arg)
}

/*
  public channel 에 메시지를 작성하기 위한 토큰을 리턴한다
*/
export const getSlackValidAT = async (teamId: string) => {
  const slackATArr = await getSlackATArrByTeamId(teamId)
  if (slackATArr.length < 1) return null

  const web = new WebClient()
  for (const slackAT of slackATArr) {
    const token = slackAT.accessToken
    const result = await web.auth.test({ token })
    if (result.ok) return token
    else logger.debug('TODO: delete invalid token')
  }

  return null
}

/*
  해당 accessToken 을 사용하는 해당 accessToken 을 사용한 모든 그룹의 accessToken 을
  __NOT_YET__ 으로 업데이트 시켜 다음 `/av` 사용시 앱 추가를 유도함
*/
export const removeAccessTokenFromGroup = async (accessToken: string) => {
  const keys = await getGroupKeysArrByAccessToken(accessToken)
  const requestArr = keys.map( ({ teamId, channelId }) => {
    return { teamId, channelId, accessToken: NOT_YET }
  })
  await updateBatchGroup(requestArr)
}

type TExpectedError = { data?: { error?: string } }
export const canPostMessageIntoChannel = async (web: WebClient, accessToken: string, channelId: string) => {
  if (accessToken === NOT_YET) return false

  const testResult = await web.auth.test()
  /*
  if (!testResult.ok) {
    // 앱 configure 삭제, 유저가 Workspace 를 나가는 상황 등
    // invalid accessToken 관련 db 정보를 삭제한다
    await deleteSlackAT(accessToken)
    await removeAccessTokenFromGroup(accessToken)
    return false
  }
  */
  // testResult.ok === true 여도 채널에 posting 권한이 없을 수 있으므로
  // conversations.invite, im.mark, mpim.mark 관련 api 를 사용해서 확인 해야함 (편법)
  // accessToken 이 해당 채널에 권한이 있는지 여부를 판단하기 위해 Wrong parameter 사용
  const users = '000_WRONG_USER_ID'
  const ts = '123'

  // 권한이 있는 경우 `user_not_found` 에러 응답 예상
  const [err] = await to<any,TExpectedError>(web.conversations.invite({ channel: channelId, users }))
  if (err && err.data && err.data.error === 'user_not_found') return true

  // 권한이 있는 경우 `invalid_timestamp` 에러 응답 예상
  const [err2] = await to<any,TExpectedError>(web.im.mark({ channel: channelId, ts }))
  if (err2 && err2.data && err2.data.error === 'invalid_timestamp') return true

  const [err3] = await to<any,TExpectedError>(web.mpim.mark({ channel: channelId, ts }))
  if (err3 && err3.data && err3.data.error === 'invalid_timestamp') return true

  return false
}

export const getConfigMsgPermalink = async (web: WebClient, group: IGroup) => {
  if (group.activationMsgTs === NOT_YET) return null

  const { channelId, activationMsgTs } = group
  const result = await getPermalink(web, channelId, activationMsgTs)
  return result
}

export const getPermalink = async (web: WebClient, channelId: string, msgTs: string) => {
  const opt: ChatGetPermalinkArguments = { channel: channelId, message_ts: msgTs }
  const [err1, r] = await to<IChatGetPermalinkResponse, WebAPICallError>(web.chat.getPermalink(opt))
  if (err1 && err1.code === 'slack_webapi_platform_error' && err1.data && err1.data.error === 'message_not_found') {
    // 활성화 메시지가 삭제된 상황
    return null
  }
  return (r && r.permalink) ? r.permalink : null
}

export const isFirstThreadMsgByPermalink = (permalink: string) => {
  if (!isNotEmptyString(permalink)) throw new Error('permalink should be not empty string')
  const { query, pathname } = url.parse(permalink)
  const { thread_ts } = querystring.parse(query || '')

  const [,,,ts] = (pathname || '').split('/')
  if (!ts) return false

  if (!thread_ts) return true

  const dotTs = checkAndConvertUrlTsToDotTs(ts)
  return thread_ts === dotTs
}

export const openViewToDelete = async (web: WebClient, payload: IMyBlockActionPayload) => {
  const { trigger_id, message, channel, response_url } = payload
  const { ts, thread_ts } = message
  const pm: IPMDeletionView = {
    channelId: channel.id, ts, threadTs: thread_ts,
    channelName: channel.name, responseUrl: response_url,
  }
  await web.views.open(getDeletionViewOpenArg(trigger_id, pm))
}

export const deleteVoiceOrReply = async (web: WebClient, payload: IMyViewSubmissionPayload) => {
  if (!isMyViewSubmissionPayload(payload)) throw new Error('Invalid payload')
  const { view, team } = payload
  const pm: IPMDeletionView = JSON.parse(view.private_metadata)
  const { channelId, ts, threadTs, responseUrl } = pm
  const isVoice = ! isReplyByTsThreadTs(ts, threadTs)

  const password = payload.view.state.values[INPUT_NAME_PASSWORD].s.value
  const groupId = getGroupId(channelId, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, threadTs ? threadTs : ts)
  const replyId = getReplyId(voiceId, ts)
  const isSuccess = isVoice ? await deleteVoice(voiceId, password) : await deleteReply(replyId, password)
  if (!isSuccess) throw new Error('WRONG_PASSWORD')

  if (isVoice) {
    const voice = await getVoice(voiceId)
    // TODO: password 입력창이 30분이상 열려있었다면 responseUrl이 만료됨
    await axios.post(responseUrl, { ...getVoiceArg(voice), ts })
    return
  }

  const reply = await getReply(replyId)
  await axios.post(responseUrl, { ...getReplyArg(reply), ts })
}

export const sendHelpOrAgreementMsg = async (web: WebClient, group: IGroup, userId: string) => {
  const permalink = await getConfigMsgPermalink(web, group)
  !! permalink
    ? await sendHelpMessage(web, group, userId, permalink)
    : await postAgreementMesssage(web, group)
}
