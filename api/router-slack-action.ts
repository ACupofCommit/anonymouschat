import { Router, RequestHandler } from 'express'
import to from 'await-to-js'
import bodyParser from 'body-parser'
import { includes } from 'lodash'

import { WebClient } from '@slack/web-api'
import { createLogger } from './logger'
import { ACTION_VOTE_REPLY_LIKE, ACTION_VOTE_REPLY_DISLIKE, ACTION_VOTE_USERREPLY_LIKE, ACTION_VOTE_USERREPLY_DISLIKE, ACTION_VOTE_VOICE_LIKE, ACTION_VOTE_VOICE_DISLIKE, ACTION_OPEN_DIALOG_DELETE_VOICE, ACTION_OPEN_DIALOG_DELETE_REPLY, ACTION_OPEN_DIALOG_DELETE_USERREPLY, ACTION_OPEN_VIEW_DELETE, ACTION_APP_USE_AGREEMENT, ACTION_APP_FORCE_ACTIVATE, ACTION_APP_FORCE_DEACTIVATE, ACTION_OPEN_DIALOG_REPLY, ACTION_OPEN_DIALOG_VOICE, ACTION_VOTE_REPORT, ACTION_SUBMISSION_VOICE, ACTION_SUBMISSION_REPLY, ACTION_SUBMISSION_DELETE, ACTION_ON_MORE_OPEN_VIEW_REPLY, ACTION_SHOW_DEACTIVATE_WARNING } from './constant'
import { isMyBlockActionPayload, isMyViewSubmissionPayload, isMoreActionPayload, IMyViewSubmissionPayload, IMyBlockActionPayload, IMoreActionPayload } from './model/model-common'
import { getOrCreateGetGroup } from './model/model-group'
import { IGroup } from '../types/type-group'
import { getConfigMsgPermalink, sendHelpMessage, postAgreementMesssage, reportVoiceOrReply, agreeAppActivation, forceAppActivate, forceAppDeactivate, deleteVoiceOrReply, openViewToDelete, showDeactivateWarning } from './slack/core-common'
import { parseWOThrow } from './util'
import { IPMNewVoiceView, isPMNewVoiceView } from '../types/type-voice'
import { IPMNewReplyView, isPMCreateReplyView } from '../types/type-reply'
import { IPMDeletionView, isPMDeletionView, IPMDeactivateWarningView, isPMDeactivateWarningView } from '../types/type-common'
import { openViewToPostVoice, createVoiceFromSlack, voteSlackVoice } from './slack/core-voice'
import { createReplyFromSlack, openViewToPostReply, voteSlackReply } from './slack/core-reply'

const logger = createLogger('action')

const getAction = (payload: any) => {
  // logger.debug("payload : "+ JSON.stringify(payload))
  const action = (
      payload.callback_id === ACTION_ON_MORE_OPEN_VIEW_REPLY ? ACTION_ON_MORE_OPEN_VIEW_REPLY

    : payload.type === 'view_submission' ? (
        payload.view.callback_id === ACTION_SUBMISSION_VOICE ? ACTION_SUBMISSION_VOICE
      : payload.view.callback_id === ACTION_SUBMISSION_REPLY ? ACTION_SUBMISSION_REPLY
      : payload.view.callback_id === ACTION_SUBMISSION_DELETE ? ACTION_SUBMISSION_DELETE
      : payload.view.callback_id === ACTION_APP_FORCE_DEACTIVATE ? ACTION_APP_FORCE_DEACTIVATE
      : '')

    : payload.type === 'block_actions' ? (
        payload.actions[0].action_id === ACTION_VOTE_REPLY_LIKE ? ACTION_VOTE_REPLY_LIKE
      : payload.actions[0].action_id === ACTION_VOTE_REPLY_DISLIKE ? ACTION_VOTE_REPLY_DISLIKE

      : payload.actions[0].action_id === ACTION_VOTE_USERREPLY_LIKE ? ACTION_VOTE_USERREPLY_LIKE
      : payload.actions[0].action_id === ACTION_VOTE_USERREPLY_DISLIKE ? ACTION_VOTE_USERREPLY_DISLIKE
      : payload.actions[0].action_id === ACTION_VOTE_VOICE_LIKE ? ACTION_VOTE_VOICE_LIKE
      : payload.actions[0].action_id === ACTION_VOTE_VOICE_DISLIKE ? ACTION_VOTE_VOICE_DISLIKE
      : payload.actions[0].action_id === ACTION_VOTE_REPORT ? ACTION_VOTE_REPORT

      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_DELETE_VOICE ? ACTION_OPEN_DIALOG_DELETE_VOICE
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_DELETE_REPLY ? ACTION_OPEN_DIALOG_DELETE_REPLY
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_DELETE_USERREPLY ? ACTION_OPEN_DIALOG_DELETE_USERREPLY
      : payload.actions[0].action_id === ACTION_OPEN_VIEW_DELETE ? ACTION_OPEN_VIEW_DELETE

      : payload.actions[0].value     === ACTION_APP_USE_AGREEMENT ? ACTION_APP_USE_AGREEMENT
      : payload.actions[0].value     === ACTION_APP_FORCE_ACTIVATE ? ACTION_APP_FORCE_ACTIVATE
      : payload.actions[0].value     === ACTION_SHOW_DEACTIVATE_WARNING ? ACTION_SHOW_DEACTIVATE_WARNING
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_REPLY ? ACTION_OPEN_DIALOG_REPLY
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_VOICE ? ACTION_OPEN_DIALOG_VOICE
      : payload.actions[0].value     === ACTION_OPEN_DIALOG_VOICE ? ACTION_OPEN_DIALOG_VOICE
      : '')
    : '')

  type TypeDeprecatedMap = {[key: string]: string}
  const comportableActionMap: TypeDeprecatedMap = {
    // 타 익명 슬랙앱과의 호환성을 위해 지원하는 ACTION_ID

    [ACTION_VOTE_USERREPLY_LIKE]: ACTION_VOTE_REPLY_LIKE,
    [ACTION_VOTE_USERREPLY_DISLIKE]: ACTION_VOTE_REPLY_DISLIKE,
    [ACTION_OPEN_DIALOG_DELETE_USERREPLY]: ACTION_OPEN_DIALOG_DELETE_REPLY,
    [ACTION_OPEN_DIALOG_DELETE_VOICE]: ACTION_OPEN_VIEW_DELETE,
    [ACTION_OPEN_DIALOG_DELETE_REPLY]: ACTION_OPEN_VIEW_DELETE,

    // TODO: 하위 호환성을 위한 코드를 계속 유지시키는 것 보다는 일정기간만 호환성을 맞추고,
    // 그 이후에는 알 수 없는 Action이 올라왔을 때,
    // 구버전 message를 update시키는 방법으로 개선 하여
    // 첫번째 액션은 동작하지 않더라도 유저가 retry시 잘 동작하도록 제공하는 것으로 개선 필요.
  }

  return comportableActionMap[action] ? comportableActionMap[action] : action
}

type TParsedPM = IPMNewVoiceView | IPMNewReplyView | IPMDeletionView | IPMDeactivateWarningView

const postingActions = [ACTION_OPEN_DIALOG_VOICE, ACTION_OPEN_DIALOG_REPLY, ACTION_ON_MORE_OPEN_VIEW_REPLY]
const needUsersAgreement = (group: IGroup, action: string) => {
  const isPostingAction = includes(postingActions, action)
  return !group.isPostingAvailable && isPostingAction
}

const sendHelpOrAgreementMsg = async (web: WebClient, group: IGroup, userId: string) => {
  const permalink = await getConfigMsgPermalink(web, group)
  !! permalink
    ? await sendHelpMessage(web, group, userId, permalink)
    : await postAgreementMesssage(web, group)
}

const handleViewSubmissionAction = async (payload: IMyViewSubmissionPayload, action: string) => {
  const { team, view } = payload
  const pm = parseWOThrow<TParsedPM>(view.private_metadata)
  if (!pm) throw new Error('PM is null')
  if (action === ACTION_SUBMISSION_VOICE && !isPMNewVoiceView(pm)) throw new Error('Wrong PM')
  if (action === ACTION_SUBMISSION_REPLY && !isPMCreateReplyView(pm)) throw new Error('Wrong PM')
  if (action === ACTION_SUBMISSION_DELETE && !isPMDeletionView(pm)) throw new Error('Wrong PM')
  if (action === ACTION_APP_FORCE_DEACTIVATE && !isPMDeactivateWarningView(pm)) throw new Error('Wrong PM')

  const { channelId, channelName } = pm
  const group = await getOrCreateGetGroup(channelId, team.id, channelName, team.enterprise_id)

  const web = new WebClient(group.accessToken)
  const r =
      action === ACTION_SUBMISSION_VOICE             ? await createVoiceFromSlack(web, payload)
    : action === ACTION_SUBMISSION_REPLY             ? await createReplyFromSlack(web, payload, group)
    : action === ACTION_SUBMISSION_DELETE            ? await deleteVoiceOrReply(web, payload)
    : action === ACTION_APP_FORCE_DEACTIVATE         ? await forceAppDeactivate(web, group, payload.user.id)
    : new Error('Unkown action: ' + action)

  if (r instanceof Error) throw r

  // view update시 r을 확인하여 응답 해야하기 때문에 r을 리턴
  return r
}

const handleBlockAction = async (payload: IMyBlockActionPayload, action: string) => {
  const { team, channel, user, response_url, trigger_id } = payload
  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)
  const web = new WebClient(group.accessToken)
  if (needUsersAgreement(group, action)) return sendHelpOrAgreementMsg(web, group, user.id)

  const r =
      action === ACTION_OPEN_DIALOG_VOICE       ? await openViewToPostVoice(web, trigger_id, channel.id, channel.name)
    : action === ACTION_OPEN_DIALOG_REPLY       ? await openViewToPostReply(web, payload)
    : action === ACTION_ON_MORE_OPEN_VIEW_REPLY ? await openViewToPostReply(web, payload)
    : action === ACTION_OPEN_VIEW_DELETE        ? await openViewToDelete(web, payload)

    : action === ACTION_VOTE_VOICE_LIKE         ? await voteSlackVoice(payload,'LIKE')
    : action === ACTION_VOTE_VOICE_DISLIKE      ? await voteSlackVoice(payload,'DISLIKE')
    : action === ACTION_VOTE_REPLY_LIKE         ? await voteSlackReply(payload,'LIKE')
    : action === ACTION_VOTE_REPLY_DISLIKE      ? await voteSlackReply(payload,'DISLIKE')
    : action === ACTION_VOTE_REPORT             ? await reportVoiceOrReply(web, payload)

    : action === ACTION_APP_USE_AGREEMENT       ? await agreeAppActivation(web, group, user.id, response_url)
    : action === ACTION_APP_FORCE_ACTIVATE      ? await forceAppActivate(web, group, user.id, response_url)
    : action === ACTION_SHOW_DEACTIVATE_WARNING ? await showDeactivateWarning(web, trigger_id, group)
    : new Error('Unkown action: ' + action)

  if (r instanceof Error) throw r
}

const handleMoreAction = async (payload: IMoreActionPayload, action: string) => {
  const { team, channel, user } = payload
  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)

  const web = new WebClient(group.accessToken)
  if (needUsersAgreement(group, action)) return sendHelpOrAgreementMsg(web, group, user.id)
  if (action !== ACTION_ON_MORE_OPEN_VIEW_REPLY) throw new Error('Unknown action from MoreAction:' + action)
  await openViewToPostReply(web, payload)
}

const handler: RequestHandler = async (req, res, next) => {
  const payload = JSON.parse(req.body.payload)
  const action = getAction(payload)
  logger.debug("action:" + action)

  const [err, r] =
      isMyViewSubmissionPayload(payload) ? await to(handleViewSubmissionAction(payload, action))
    : isMyBlockActionPayload(payload)    ? await to(handleBlockAction(payload, action))
    : isMoreActionPayload(payload)       ? await to(handleMoreAction(payload, action))
    : [new Error('Can not handle payload')]

  if (err) return next(err)
  if (r && r.response_action === 'update') return res.send(r)
  res.status(200).end()
}

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.all('/', handler)

export default router
