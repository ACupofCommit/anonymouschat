import { Middleware, SlackActionMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt"
import to from "await-to-js"
import { voteSlackVoice, voteSlackReply, reportVoiceOrReply, openViewToDelete, deleteVoiceOrReply } from "@anonymouslack/universal/dist/core"
import { isMyBlockActionPayload, ACTION_VOTE_VOICE_LIKE, ACTION_VOTE_VOICE_DISLIKE, ACTION_VOTE_REPLY_LIKE, ACTION_VOTE_REPLY_DISLIKE, isMyViewSubmissionPayload, INPUT_NAME_PASSWORD, STR_NOT_MATCHED_PASSWORD } from "@anonymouslack/universal/dist/models"
import { IPMNewVoiceView, IPMNewReplyView, IPMDeletionView, IPMDeactivateWarningView } from "@anonymouslack/universal/dist/types"

interface ResponseUrl {
  block_id: string
  action_id: string
  channel_id: string
  response_url: string
}

type TParsedPM = IPMNewVoiceView | IPMNewReplyView | IPMDeletionView | IPMDeactivateWarningView

export const handleLikeOrDislike: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, action,
}) => {
  const actionId = (action as any).action_id
  if (!actionId) throw new Error('No actionId')

  const {channel, team, user} = body
  if (!channel || !channel.id) throw new Error('no channel')
  if (!team) throw new Error('no team')
  if (!isMyBlockActionPayload(body)) throw new Error('Worng MyBlockActionPayload type')

  await ack()
  switch(actionId) {
    case ACTION_VOTE_VOICE_LIKE:
      await voteSlackVoice(body,'LIKE')
      return
    case ACTION_VOTE_VOICE_DISLIKE:
      await voteSlackVoice(body,'DISLIKE')
      return
    case ACTION_VOTE_REPLY_LIKE:
      await voteSlackReply(body,'LIKE')
      return
    case ACTION_VOTE_REPLY_DISLIKE:
      await voteSlackReply(body,'DISLIKE')
      return
  }

  throw new Error('Unknown actionId: ' + actionId)
}

export const handleReport: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, client,
}) => {
  if (!isMyBlockActionPayload(body)) throw new Error('Wrong MyBlockActionPayload type')

  await ack()
  await reportVoiceOrReply(client, body)
}

export const handleOpenViewToDelete: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, client,
}) => {
  if (!isMyBlockActionPayload(body)) throw new Error('Worng MyBlockActionPayload type')

  await ack()
  await openViewToDelete(client, body)
}

export const handleSubmitDelete: Middleware<SlackViewMiddlewareArgs> = async ({
  ack, body, client,
}) => {
  if (!isMyViewSubmissionPayload(body)) throw new Error('Wrong MyViewSubmissionPayload type')

  const [err] = await to(deleteVoiceOrReply(client, body))
  if (err?.message === 'WRONG_PASSWORD') {
    await ack({
      response_action: 'errors',
      errors: {
        [INPUT_NAME_PASSWORD]: STR_NOT_MATCHED_PASSWORD,
      }
    })
    return
  }
  await ack()
}
