import { Router } from 'express'
import to from 'await-to-js'
import bodyParser from 'body-parser'
import { includes } from 'lodash'

import { WebClient } from '@slack/web-api'
import { createLogger } from './logger'
import { ACTION_INTERACTIVE_MENU_USERREPLY, ACTION_VOTE_REPLY_LIKE, ACTION_VOTE_REPLY_DISLIKE, ACTION_VOTE_USERREPLY_LIKE, ACTION_VOTE_USERREPLY_DISLIKE, ACTION_VOTE_VOICE_LIKE, ACTION_VOTE_VOICE_DISLIKE, ACTION_OPEN_DIALOG_DELETE_VOICE, ACTION_OPEN_DIALOG_DELETE_REPLY, ACTION_OPEN_DIALOG_DELETE_USERREPLY, ACTION_OPEN_VIEW_DELETE, ACTION_APP_USE_AGREEMENT, ACTION_APP_FORCE_ACTIVATE, ACTION_APP_FORCE_DEACTIVATE, ACTION_OPEN_DIALOG_REPLY, ACTION_OPEN_DIALOG_VOICE, ACTION_APP_ACCEPTED_NEW_MESSAGE, ACTION_VOTE_REPORT } from './constant'
import { isMyBlockActionPayload } from './model/model-common'
import { getOrCreateGetGroup } from './model/model-group'
import { isGroup } from '../types/type-group'
import { getBEHRError } from '../common/common-util'
import { getConfigMsgPermalink, sendHelpMessage, postAgreementMesssage, voteSlackVoice, voteSlackReply, reportVoiceOrReply, agreeAppActivation, forceAppActivate, forceAppDeactivate } from './slack/core'

const logger = createLogger('action')

const getAction = (payload: any) => {
  // logger.debug("payload : "+ JSON.stringify(payload))
  const action = (
      payload.callback_id === ACTION_INTERACTIVE_MENU_USERREPLY ? ACTION_INTERACTIVE_MENU_USERREPLY

    : payload.type === 'block_actions' ? (
        payload.actions[0].action_id === ACTION_VOTE_REPLY_LIKE ? ACTION_VOTE_REPLY_LIKE
      : payload.actions[0].action_id === ACTION_VOTE_REPLY_DISLIKE ? ACTION_VOTE_REPLY_DISLIKE

      : payload.actions[0].action_id === ACTION_VOTE_USERREPLY_LIKE ? ACTION_VOTE_USERREPLY_LIKE
      : payload.actions[0].action_id === ACTION_VOTE_USERREPLY_DISLIKE ? ACTION_VOTE_USERREPLY_DISLIKE
      : payload.actions[0].action_id === ACTION_VOTE_VOICE_LIKE ? ACTION_VOTE_VOICE_LIKE
      : payload.actions[0].action_id === ACTION_VOTE_VOICE_DISLIKE ? ACTION_VOTE_VOICE_DISLIKE

      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_DELETE_VOICE ? ACTION_OPEN_DIALOG_DELETE_VOICE
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_DELETE_REPLY ? ACTION_OPEN_DIALOG_DELETE_REPLY
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_DELETE_USERREPLY ? ACTION_OPEN_DIALOG_DELETE_USERREPLY
      : payload.actions[0].action_id === ACTION_OPEN_VIEW_DELETE ? ACTION_OPEN_VIEW_DELETE

      : payload.actions[0].value     === ACTION_APP_USE_AGREEMENT ? ACTION_APP_USE_AGREEMENT
      : payload.actions[0].value     === ACTION_APP_FORCE_ACTIVATE ? ACTION_APP_FORCE_ACTIVATE
      : payload.actions[0].value     === ACTION_APP_FORCE_DEACTIVATE ? ACTION_APP_FORCE_DEACTIVATE
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_REPLY ? ACTION_OPEN_DIALOG_REPLY
      : payload.actions[0].action_id === ACTION_OPEN_DIALOG_VOICE ? ACTION_OPEN_DIALOG_VOICE
      : payload.actions[0].value     === ACTION_OPEN_DIALOG_VOICE ? ACTION_OPEN_DIALOG_VOICE
      : payload.actions[0].value     === ACTION_APP_ACCEPTED_NEW_MESSAGE ? ACTION_APP_ACCEPTED_NEW_MESSAGE

      : payload.actions[0].action_id === ACTION_VOTE_REPORT ? ACTION_VOTE_REPORT
      : '')
    : '')

  return action
}

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.all('/', async (req, res, next) => {
  const payload = JSON.parse(req.body.payload)
  const action = getAction(payload)
  logger.debug("action:" + action)

  if (isMyBlockActionPayload(payload)) {
    const { team, channel, user, response_url } = payload
    const [err,group] = await to(getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id))
    if (!isGroup(group)) return next(getBEHRError(err, 'Wrong getOrCreateGetGroup()'))

    const web = new WebClient(group.accessToken)
    // slack posting action은 추후 구현 예정
    const isPostingAction = includes([ACTION_OPEN_DIALOG_VOICE, ACTION_OPEN_DIALOG_REPLY], action)
    if (!group.isPostingAvailable && isPostingAction) {
      const permalink = await getConfigMsgPermalink(web, group)
      const [err] = !! permalink
        ? await to(sendHelpMessage(web, group, user.id, permalink))
        : await to(postAgreementMesssage(web, group))

      return err ? next(err) : res.status(200).end()
    }

    const [err2] =
        action === ACTION_VOTE_VOICE_LIKE              ? await to(voteSlackVoice(payload,'LIKE'))
      : action === ACTION_VOTE_VOICE_DISLIKE           ? await to(voteSlackVoice(payload,'DISLIKE'))

      : action === ACTION_VOTE_REPLY_LIKE              ? await to(voteSlackReply(payload,'LIKE'))
      : action === ACTION_VOTE_REPLY_DISLIKE           ? await to(voteSlackReply(payload,'DISLIKE'))

      : action === ACTION_VOTE_REPORT                  ? await to(reportVoiceOrReply(web, payload))

      : action === ACTION_APP_USE_AGREEMENT            ? await to(agreeAppActivation(web, group, user.id, response_url))
      : action === ACTION_APP_FORCE_ACTIVATE           ? await to(forceAppActivate(group, user.id, response_url))
      : action === ACTION_APP_FORCE_DEACTIVATE         ? await to(forceAppDeactivate(group, user.id, response_url))

      : [new Error('Unkown action: ' + action)]

    if(err2) return next(err2)
  }

  res.status(200).end()
})

export default router
