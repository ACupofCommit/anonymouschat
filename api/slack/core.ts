import axios from 'axios'
import to from 'await-to-js'
import { isObject } from "lodash"
import { WebClient, WebAPICallError, ChatGetPermalinkArguments } from "@slack/web-api"
import { ChatPostMessageResponse, ChatGetPermalinkResponse } from 'seratch-slack-types/web-api'

import { NOT_YET, ACTIVATION_QUORUM, VOICE_LIMIT_RECENT24H } from '../constant'
import { getVoiceArg } from './argument-voice'
import { getReplyArg } from './argument-reply'
import { getConfigMsgArg, getHelpMessageArg, getAlreadyAgreedMessageArg } from './argument-config'
import { createLogger } from '../logger'
import { IParamNewVoice, IVoice, isVoice } from '../../types/type-voice'
import { IParamNewReply, IReply } from '../../types/type-reply'
import { newReply, putReply, getReply } from '../model/model-reply'
import { isNotEmptyString, getMSFromHours, toggle } from '../../common/common-util'
import { IGroup } from '../../types/type-group'
import { getSlackATArrByTeamId, deleteSlackAT } from '../model/model-slackAT'
import { putVoice, newVoice, getVoiceIdArrByTimeRange, getVoice } from '../model/model-voice'
import { putGroup, getGroup, updateBatchGroup, getGroupKeysArrByAccessToken } from '../model/model-group'
import { getGroupId, getVoiceId, getReplyId, IMyBlockActionPayload } from '../model/model-common'

const logger = createLogger('core')

export const postAndPutSlackVoice = async (web: WebClient, param: IParamNewVoice) => {
  const now = Date.now()
  const yesterday = new Date(now - getMSFromHours(24)).getTime()
  const arr = await getVoiceIdArrByTimeRange(yesterday, now, param.groupId)
  if (arr.length >= VOICE_LIMIT_RECENT24H) throw new Error('VOICE_LIMIT_RECENT24H')

  const voice = newVoice(param)
  const result = await web.chat.postMessage(getVoiceArg(voice))
  if (!isNotEmptyString(result.ts)) throw new Error('Wrong result.ts')

  const voiceId = getVoiceId(param.groupId, result.ts)
  const updatedVoice = await putVoice({ ...voice, voiceId, platformId: result.ts })
  await web.chat.update({ ...getVoiceArg(updatedVoice), ts: result.ts })
}

export const postAndPutReply = async (web: WebClient, param: IParamNewReply) => {
  const { threadTs, groupId } = param
  const reply = newReply(param)
  const replyArg = getReplyArg(reply, threadTs)
  const result: ChatPostMessageResponse = await web.chat.postMessage(replyArg)
  if (!result.ts) throw new Error('Wrong result.ts')

  const voiceId = getVoiceId(groupId, threadTs)
  const replyId = getReplyId(voiceId, result.ts)
  await putReply({ ...reply, replyId, platformId: result.ts })
}

export const voteSlackVoice = async (payload: IMyBlockActionPayload, type: 'LIKE' | 'DISLIKE') => {
  const { container, channel, team, user } = payload
  const groupId = getGroupId(channel.id, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, container.message_ts)
  const v = await getVoice(voiceId)

  const userLikeArr = type === 'LIKE' ? toggle(v.userLikeArr, user.id) : v.userLikeArr
  const userDislikeArr = type === 'DISLIKE' ? toggle(v.userDislikeArr, user.id) : v.userDislikeArr
  const newVoice: IVoice = { ...v, userLikeArr, userDislikeArr }

  const updatedVoice = await putVoice(newVoice)
  await axios.post(payload.response_url, getVoiceArg(updatedVoice))
}

export const voteSlackReply = async (payload: IMyBlockActionPayload, type: 'LIKE' | 'DISLIKE') => {
  const { team, channel, container, user, response_url } = payload
  if (!container.thread_ts) throw new Error('not found message.thread_ts')

  const groupId = getGroupId(channel.id, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, container.thread_ts)
  const replyId = getReplyId(voiceId, container.message_ts)
  const r = await getReply(replyId)

  const userLikeArr = type === 'LIKE' ? toggle(r.userLikeArr, user.id) : r.userLikeArr
  const userDislikeArr = type === 'DISLIKE' ? toggle(r.userDislikeArr, user.id) : r.userDislikeArr
  const newReply: IReply = { ...r, userLikeArr, userDislikeArr }

  const updatedReply = await putReply(newReply)
  await axios.post(response_url, getReplyArg(updatedReply))
}

export const reportVoiceOrReply = async (web: WebClient, payload: IMyBlockActionPayload) => {
  const { team, channel, container, user } = payload
  const ts = container.message_ts
  const threadTs = container.thread_ts || ts
  const isVoiceButton = ts === threadTs

  const groupId = getGroupId(channel.id, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, threadTs)
  const replyId = getReplyId(voiceId, ts)
  const group = await getGroup(channel.id)

  const voiceOrReply = isVoiceButton ? await getVoice(voiceId) : await getReply(replyId)
  const userReportArr = toggle(voiceOrReply.userReportArr, user.id)
  // 콘셉: 한번 isHiddenByReport: true 된 경우 번복되지 않음.
  const isHiddenByReport = voiceOrReply.isHiddenByReport || userReportArr.length >= (group.numberOfReportToHidden || 1)
  // 신고 개수 상승으로 hidden 처리가 될 수 있으므로 updateVoice 에서 반환된 voice를 사용
  const tmp: IVoice | IReply = { ...voiceOrReply, userReportArr, isHiddenByReport }
  const updated: IVoice | IReply = isVoice(tmp) ? await putVoice(tmp) : await putReply(tmp)
  const arg = isVoice(updated) ? getVoiceArg(updated) : getReplyArg(updated)
  await web.chat.update({ ...arg, ts })
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

export const agreeAppActivation = async (web: WebClient, group: IGroup, userId: string, responseUrl: string) => {
  if (group.agreedUserArr.indexOf(userId) > -1) {
    const alreadyArg = getAlreadyAgreedMessageArg(group.channelId, userId)
    return await to(web.chat.postEphemeral(alreadyArg))
  }

  // force agreement 가 있으므로, ACTIVATION_QUORUM 을 넘지 않는
  // isPostingAvailable: true 가 있을 수 있는데 이 경우 false 로 변경하면 안됨
  const agreedUserArr = [...group.agreedUserArr, userId]
  const isPostingAvailable = group.forceActivateUserId !== NOT_YET ? true : agreedUserArr.length >= ACTIVATION_QUORUM
  const updatedGroup = await putGroup({ ...group, agreedUserArr, isPostingAvailable })
  await axios.post(responseUrl, getConfigMsgArg(updatedGroup))
}

export const forceAppActivate = async (group: IGroup, forceActivateUserId: string, responseUrl: string) => {
  const updatedGroup = await putGroup({
    ...group, isPostingAvailable: true, forceActivateUserId, forceDeactivateUserId: NOT_YET,
  })
  await axios.post(responseUrl, getConfigMsgArg(updatedGroup))
}

export const forceAppDeactivate = async (group: IGroup, forceDeactivateUserId: string, responseUrl: string) => {
  const updatedGroup = await putGroup({
    ...group, agreedUserArr: [], isPostingAvailable: false, forceDeactivateUserId, forceActivateUserId: NOT_YET,
  })
  await axios.post(responseUrl, getConfigMsgArg(updatedGroup))
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
export const canPostMessageIntoChannel = async (accessToken: string, channelId: string) => {
  if (accessToken === NOT_YET) return false

  const web = new WebClient(accessToken)
  const testResult = await web.auth.test()
  if (!testResult.ok) {
    // 앱 configure 삭제, 유저가 Workspace 를 나가는 상황 등
    // invalid accessToken 관련 db 정보를 삭제한다
    await deleteSlackAT(accessToken)
    await removeAccessTokenFromGroup(accessToken)
    return false
  }
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
  const opt: ChatGetPermalinkArguments = { channel: channelId, message_ts: activationMsgTs }
  const [err1, r] = await to<ChatGetPermalinkResponse, WebAPICallError>(web.chat.getPermalink(opt))
  if (err1 && err1.code === 'slack_webapi_platform_error' && err1.data && err1.data.error === 'message_not_found') {
    // 활성화 메시지가 삭제된 상황
    return null
  }
  return (r && r.permalink) ? r.permalink : null
}
