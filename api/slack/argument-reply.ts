import gp from 'generate-password'
import { compact } from 'lodash'
import sillyname from 'sillyname'
import { DialogOpenArguments, ChatPostMessageArguments, Action, Button } from '@slack/web-api'

import { INPUT_NAME_NICKNAME, INPUT_NAME_CONTENT, INPUT_NAME_PASSWORD, ACTION_VOTE_REPLY_LIKE, ACTION_VOTE_REPLY_DISLIKE, ACTION_VOTE_REPORT, password_min_length, nickname_min_length, nickname_max_length, password_max_length } from '../constant'
import { STR_APP_NAME, STR_DIALOG_PASSWORD_TITLE, STR_DIALOG_PASSWORD_HINT, STR_LIKE, STR_DISLIKE, STR_DIALOG_NICKNAME_TITLE, STR_DIALOG_NICKNAME_PLACEHOLDER, STR_REPORT, STR_REPORT_N } from '../strings'
import { IReply } from '../../types/type-reply'

export const getNewReplyDialogArg = (callbackId: string, trigger_id: string, stateValue: string): DialogOpenArguments => {
  return {
    trigger_id,
    dialog: {
      "callback_id": callbackId,
      state: stateValue,
      "title": STR_APP_NAME,
      "submit_label": "Reply",
      "elements": [
        {
          "type": "text",
          "value": sillyname().split(' ')[0],
          "label": STR_DIALOG_NICKNAME_TITLE,
          "name": INPUT_NAME_NICKNAME,
          "min_length": nickname_min_length,
          "max_length": nickname_max_length,
          "placeholder": STR_DIALOG_NICKNAME_PLACEHOLDER,
        },
        {
          "type": "textarea",
          "label": "Reply as anonymous",
          "name": INPUT_NAME_CONTENT
        },
        {
          "type": "text",
          value: gp.generate({ length: 16, numbers: true }),
          "label": STR_DIALOG_PASSWORD_TITLE,
          "name": INPUT_NAME_PASSWORD,
          "min_length": password_min_length,
          "max_length": password_max_length,
          "hint": STR_DIALOG_PASSWORD_HINT
        }
      ]
    },
  }
}

export const getReplyArg = (reply: IReply, thread_ts?: string): ChatPostMessageArguments => {
  const { userLikeArr, userDislikeArr, userReportArr, content, isHiddenByReport } = reply
  const strCountLike = userLikeArr.length === 0 ? STR_LIKE : `${STR_LIKE} ${userLikeArr.length}`
  const strCountDislike = userDislikeArr.length === 0 ? STR_DISLIKE : `${STR_DISLIKE} ${userDislikeArr.length}`
  const strCountReport = userReportArr.length === 0 ? STR_REPORT : STR_REPORT_N.replace("%d", ""+userReportArr.length)
  return {
    text: '',
    channel: reply.voiceId.split('-')[2],
    as_user: false,
    thread_ts,   // 새로운 reply 에만 필요
    icon_emoji: reply.faceImoji,
    username: reply.nickname,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: content }},
      {
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
            action_id: ACTION_VOTE_REPORT,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountReport, "emoji": true },
          }
        ])
      }
    ]
  }
}

export const getReplyDeletionDialogArg = (callbackId: string, triggerId: string, state: string): DialogOpenArguments => {
  return {
    trigger_id: triggerId,
    dialog: {
      "callback_id": callbackId,
      "title": STR_APP_NAME,
      "submit_label": "Delete",
      state,
      "elements": [
        {
          "type": "text",
          "label": STR_DIALOG_PASSWORD_TITLE,
          "name": "messagebox_password",
          "min_length": password_min_length,
          "max_length": password_max_length,
          // "hint": isPasswordCorrect ? "" : "Wrong password, try again"
        }
      ]
    },
  }
}

