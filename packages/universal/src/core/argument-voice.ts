import { compact } from 'lodash'
import { ChatPostMessageArguments, KnownBlock, Action, Button, ViewsOpenArguments, View } from '@slack/web-api'

import { ACTION_VOTE_VOICE_LIKE, ACTION_VOTE_VOICE_DISLIKE, ACTION_VOTE_REPORT, ACTION_OPEN_DIALOG_REPLY, ACTION_OPEN_VIEW_DELETE, ACTION_SUBMISSION_VOICE, CONST_APP_NAME, getChannelIdFromGroupId } from '../models'
import { IPMNewVoiceView, IVoice } from '../types/type-voice'
import { getInputFaceImojiBlock, getInputNicknameBlock, getInputContentBlock, getInputPasswordBlock, getContent } from './argument-common'
import { getMessageFromChannelId } from './nls'

export const getVoiceArg = (voice: IVoice): ChatPostMessageArguments => {
  const m = getMessageFromChannelId(getChannelIdFromGroupId(voice.groupId))
  const { nickname, faceImoji, userLikeArr, userDislikeArr, userReportArr, isHiddenByReport } = voice
  const strCountLike = userLikeArr.length === 0 ? m.STR_LIKE : `${m.STR_LIKE} ${userLikeArr.length}`
  const strCountDislike = userDislikeArr.length === 0 ? m.STR_DISLIKE : `${m.STR_DISLIKE} ${userDislikeArr.length}`
  const strCountReport = userReportArr.length === 0 ? m.STR_REPORT : m.STR_REPORT_N.replace("%d", ""+userReportArr.length)
  const content = getContent(voice)

  return {
    channel: voice.groupId.split('-')[2],
    icon_emoji: faceImoji,
    text: m.STR_TEXT_FOR_CREATION_VOICE,
    username: nickname,
    blocks: compact<KnownBlock>([
      { type: "section", text: { type: "mrkdwn", text: content }},
      !isHiddenByReport && !voice.isDeleted && {
        "type": "actions",
        "elements": compact<Action | Button>([
          {
            action_id: ACTION_VOTE_VOICE_LIKE,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountLike, "emoji": true },
          },
          {
            action_id: ACTION_VOTE_VOICE_DISLIKE,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountDislike, "emoji": true },
          },
          {
            action_id: ACTION_OPEN_DIALOG_REPLY,
            "type": "button",
            "text": { "type": "plain_text", "text": m.STR_REPLY_AS_ANON, "emoji": true },
            "style": "primary",
          },
          {
            action_id: ACTION_OPEN_VIEW_DELETE,
            "type": "button",
            "text": { "type": "plain_text", "text": m.STR_DELETE, "emoji": true },
            "style": "danger",
          },
          {
            action_id: ACTION_VOTE_REPORT,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountReport, "emoji": true },
          }
        ])
      },
    ]),
  }
}

export const getNewVoiceView = (pm: IPMNewVoiceView): View => {
  const {channelId} = pm
  const m = getMessageFromChannelId(channelId)
  return {
    private_metadata: JSON.stringify(pm),
    callback_id: ACTION_SUBMISSION_VOICE,
    "type": "modal",
    "title": { "type": "plain_text", "text": CONST_APP_NAME, "emoji": true },
    "submit": { "type": "plain_text", "text": "Post", "emoji": true  },
    "close": { "type": "plain_text", "text": "Cancel", "emoji": true },
    "blocks": [
      getInputFaceImojiBlock(m),
      getInputNicknameBlock(m),
      getInputContentBlock(m.STR_DIALOG_MESSAGES_TITLE, m.STR_DIALOG_VOICE_PLACEHOLDER),
      getInputPasswordBlock(m),
    ]
  }
}

export const getNewVoiceViewsArg = (trigger_id: string, pm: IPMNewVoiceView): ViewsOpenArguments => {
  return {
    trigger_id,
    view: getNewVoiceView(pm),
  }
}
