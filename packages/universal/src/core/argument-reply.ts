import { compact } from 'lodash'
import { ChatPostMessageArguments, KnownBlock, Action, Button, ViewsOpenArguments } from '@slack/web-api'

import { ACTION_VOTE_REPLY_LIKE, ACTION_VOTE_REPLY_DISLIKE, ACTION_VOTE_REPORT, ACTION_SUBMISSION_REPLY, ACTION_OPEN_DIALOG_DELETE_REPLY, CONST_APP_NAME } from '../models'
import { IReply, IPMNewReplyView } from '../types/type-reply'
import { getInputFaceImojiBlock, getInputNicknameBlock, getInputContentBlock, getInputPasswordBlock, getContent } from './argument-common'
import { getMessageFromChannelId } from './nls'
import { parseVoiceId } from '../types'

export const getNewReplyViewsOpen = (trigger_id: string, pm: IPMNewReplyView): ViewsOpenArguments => {
  const m = getMessageFromChannelId(pm.channelId)
  return {
    trigger_id,
    view: {
      private_metadata: JSON.stringify(pm),
      "callback_id": ACTION_SUBMISSION_REPLY,
      "type": "modal",
      "title": { "type": "plain_text", "text": CONST_APP_NAME, "emoji": true },
      "submit": { "type": "plain_text", "text": "Reply", "emoji": true },
      "close": { "type": "plain_text", "text": "Cancel", "emoji": true },
      "blocks": [
        getInputFaceImojiBlock(m),
        getInputNicknameBlock(m),
        getInputContentBlock(m.STR_LABEL_CONTENT, m.STR_PLACEHOLDER_CONTENT_FOR_REPLY),
        getInputPasswordBlock(m),
      ],
    },
  }
}

export const getReplyArg = (reply: IReply, thread_ts?: string): ChatPostMessageArguments => {
  const { userLikeArr, userDislikeArr, userReportArr, isHiddenByReport, voiceId } = reply
  const {channelId} = parseVoiceId(voiceId)
  const m = getMessageFromChannelId(channelId)
  const strCountLike = userLikeArr.length === 0 ? m.STR_LIKE : `${m.STR_LIKE} ${userLikeArr.length}`
  const strCountDislike = userDislikeArr.length === 0 ? m.STR_DISLIKE : `${m.STR_DISLIKE} ${userDislikeArr.length}`
  const strCountReport = userReportArr.length === 0 ? m.STR_REPORT : m.STR_REPORT_N.replace("%d", ""+userReportArr.length)

  return {
    text: '',
    channel: reply.voiceId.split('-')[2],
    thread_ts,   // 새로운 reply 에만 필요
    icon_emoji: reply.faceImoji,
    username: reply.nickname,
    blocks: compact<KnownBlock>([
      { type: "section", text: { type: "mrkdwn", text: getContent(reply) }},
      !isHiddenByReport && !reply.isDeleted && {
        "type": "actions",
        "elements": compact<Action | Button>([
          {
            action_id: ACTION_VOTE_REPLY_LIKE,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountLike, "emoji": true },
          },
          {
            action_id: ACTION_VOTE_REPLY_DISLIKE,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountDislike, "emoji": true },
          },
          !isHiddenByReport && !reply.isDeleted && {
            action_id: ACTION_OPEN_DIALOG_DELETE_REPLY,
            "type": "button",
            "text": { "type": "plain_text", "text": m.STR_DELETE, "emoji": true },
            "style": "danger",
          },
          !isHiddenByReport && !reply.isDeleted && {
            action_id: ACTION_VOTE_REPORT,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountReport, "emoji": true },
          }
        ])
      }
    ])
  }
}
