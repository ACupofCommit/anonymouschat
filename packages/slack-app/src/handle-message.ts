import { Middleware, SlackActionMiddlewareArgs, SlackShortcutMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt"
import { getOrCreateGetGroup, isMyBlockActionPayload, isMyViewSubmissionPayload } from '@anonymouschat/universal/dist/models'
import { IPMDeactivateWarningView, IPMDeletionView, IPMNewReplyView, IPMNewVoiceView } from "@anonymouschat/universal/dist/types"
import { createReplyFromSlack, createVoiceFromSlack, openViewToPostReply, openViewToPostVoice, sendHelpOrAgreementMsg } from "@anonymouschat/universal/dist/core"
import { parseWOThrow } from "@anonymouschat/universal/dist/utils"

type TParsedPM = IPMNewVoiceView | IPMNewReplyView | IPMDeletionView | IPMDeactivateWarningView

export const handleOpenViewToNewVoice: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, client
}) => {
  const {channel, team, user} = body
  if (!channel || !channel.id) throw new Error('no channel')
  if (!team) throw new Error('no team')

  const trigger_id = (body as any).trigger_id
  if (!trigger_id) throw new Error('No trigger_id')

  await ack()

  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)
  if (!group.isPostingAvailable) {
    return sendHelpOrAgreementMsg(client, group, user.id)
  }

  // TODO: say나 respond를 여기에서 사용하자.
  await openViewToPostVoice(client, trigger_id, channel.id, channel.name)
}

export const handleOpenViewToNewReply: Middleware<SlackActionMiddlewareArgs | SlackShortcutMiddlewareArgs> = async ({
  ack, body, client
}) => {
  if (!isMyBlockActionPayload(body)) throw new Error('Wrong MyBlockActionPayload type')

  await ack()

  const {channel, team, user} = body
  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)
  if (!group.isPostingAvailable) {
    return sendHelpOrAgreementMsg(client, group, user.id)
  }

  await openViewToPostReply(client, body)
}

export const handleSubmitNewVoice: Middleware<SlackViewMiddlewareArgs> = async ({
  ack, body, client, payload
}) => {
  const {team, user} = body
  const pm = parseWOThrow<TParsedPM>(payload.private_metadata)
  if (!pm) throw new Error('No pm')
  if (!team) throw new Error('no team')
  if (!isMyViewSubmissionPayload(body)) throw new Error('Wrong payload type')

  await ack()
  await createVoiceFromSlack(client, body)
}

export const handleSubmitNewReply: Middleware<SlackViewMiddlewareArgs> = async ({
  ack, body, client, payload
}) => {
  const {team, user} = body
  const pm = parseWOThrow<TParsedPM>(payload.private_metadata)
  if (!pm) throw new Error('No pm')
  if (!team) throw new Error('no team')
  if (!isMyViewSubmissionPayload(body)) throw new Error('Wrong payload type')

  await ack()

  const group = await getOrCreateGetGroup(pm.channelId, team.id, pm.channelName, team.enterprise_id)
  await createReplyFromSlack(client, body, group)
}
