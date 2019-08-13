import { compact } from 'lodash'
import { ChatPostMessageArguments, Action, Button } from '@slack/web-api'

import { ACTION_VOTE_VOICE_LIKE, ACTION_VOTE_VOICE_DISLIKE, ACTION_VOTE_REPORT, NOT_YET } from '../constant'
import { STR_LIKE, STR_DISLIKE, STR_REPORT, STR_REPORT_N, STR_THIS_VOICE_ID } from '../strings'
import { IVoice } from '../../types/type-voice'

export const getVoiceArg = (voice: IVoice): ChatPostMessageArguments => {
  const { nickname, faceImoji, userLikeArr, userDislikeArr, userReportArr, isHiddenByReport } = voice
  const strCountLike = userLikeArr.length === 0 ? STR_LIKE : `${STR_LIKE} ${userLikeArr.length}`
  const strCountDislike = userDislikeArr.length === 0 ? STR_DISLIKE : `${STR_DISLIKE} ${userDislikeArr.length}`
  const strCountReport = userReportArr.length === 0 ? STR_REPORT : STR_REPORT_N.replace("%d", ""+userReportArr.length)

  const content = voice.platformId !== NOT_YET
    ? voice.content + '\n\n' + STR_THIS_VOICE_ID.replace('%s', voice.platformId)
    : voice.content

  return {
    channel: voice.groupId.split('-')[2],
    icon_emoji: faceImoji,
    as_user: false,
    text: '',
    username: nickname,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: content }},
      {
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
          !isHiddenByReport && !voice.isDeleted && {
            action_id: ACTION_VOTE_REPORT,
            "type": "button",
            "text": { "type": "plain_text", "text": strCountReport, "emoji": true },
          }
        ])
      },
    ],
  }
}
