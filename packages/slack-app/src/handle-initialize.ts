import to from 'await-to-js'
import { Middleware, SlackActionMiddlewareArgs, SlackShortcutMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt"
import { IPMDeactivateWarningView, IPMDeletionView, IPMNewReplyView, IPMNewVoiceView, isWebAPIPlatformError, ResponseUrl } from '@anonymouslack/universal/dist/types'
import { getOrCreateGetGroup } from '@anonymouslack/universal/dist/models'
import { agreeAppActivation, forceAppActivate, forceAppDeactivate, getConfigMsgPermalink, getSelectingChannelToInitialView, postAgreementMesssage, showDeactivateWarning, getNewVoiceView, sendHelpOrAgreementMsg } from '@anonymouslack/universal/dist/core'
import { parseWOThrow } from '@anonymouslack/universal/dist/utils'
import { WebAPIPlatformError } from '@slack/web-api'
import { Messages } from '@anonymouslack/universal/dist/types/messages'

type TParsedPM = IPMNewVoiceView | IPMNewReplyView | IPMDeletionView | IPMDeactivateWarningView

export const handleShortcut: Middleware<SlackShortcutMiddlewareArgs> = async ({body, ack, client, context}) => {
  await ack()
  const {trigger_id} = body
  const {messages: m} = context

  const bot = await client.auth.test()
  if (typeof bot.user_id !== 'string') throw new Error('Can not get bot.user_id')

  const viewOpenArg = getSelectingChannelToInitialView(m, trigger_id, bot.user_id)
  await client.views.open(viewOpenArg)
}

export const handleSubmitInit: Middleware<SlackViewMiddlewareArgs> = async ({body, ack, client, context}) => {
  console.log('handleSubmitInit')
  const m = context.messages as Messages
  const {user, team} = body
  const responseUrls = (body as any).response_urls as ResponseUrl[]

  if (responseUrls.length < 1) {
    return await ack({
      response_action: 'errors',
      errors: {
        target_channel: m.P_SELECT_CHANNEL,
      },
    })
  }

  const {channel_id} = responseUrls[0]
  console.log('channel_id: ' + channel_id)

  const [err0] = await to<any, WebAPIPlatformError>(client.conversations.info({ channel: channel_id }))
  if (err0 && !isWebAPIPlatformError(err0)) throw err0
  if (err0 && err0.data.error !== 'channel_not_found') throw err0
  if (err0) {
    return await ack({
      response_action: 'errors',
      errors: {
        target_channel: m.P_ADD_APP_AND_RETRY,
      },
    })
  }

  const group = await getOrCreateGetGroup(channel_id, team?.id || '', 'private-channel', team?.enterprise_id)
  if (group.isPostingAvailable) {
    // 메시지를 작성할 수 있으면 컨피그 메시지 존재 여부 확인 없이
    // 바로 메시지 작성 view 오픈.
    // TODO: 컨피그 메시지 접근 할 수 있는 view 제공 필요.
    return await ack({
      response_action: 'update',
      view: getNewVoiceView({ channelId: channel_id }),
    })
  }

  // TODO: 컨피그 메시지 접근 할 수 있는 view 가 없을 경우,
  // isPostingAvailable 을 변경할 수 없으는 문제가 있어
  // 절대 이 아래 코드가 실행 될 수 없음.

  await ack()
  const permalink = await getConfigMsgPermalink(client, group)
  if (permalink) {
    return await sendHelpOrAgreementMsg(client, group, user.id)
  }

  // 컨피그 메시지가 없거나(최초 실행) 삭제된 상태. 컨피그 메시지 작성
  await postAgreementMesssage(client, group)
}

export const handleAgreeAction: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, client
}) => {
  const {channel, team, user} = body
  if (!channel || !channel.id) throw new Error('no channel')
  if (!team) throw new Error('no team')

  await ack()
  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)
  // TODO: say나 respond를 여기에서 사용하자.
  await agreeAppActivation(client, group, user.id, (body as any).response_url)
}

export const handleForceAgreeAction: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, client
}) => {
  const {channel, team, user} = body
  if (!channel || !channel.id) throw new Error('no channel')
  if (!team) throw new Error('no team')

  await ack()
  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)
  // TODO: say나 respond를 여기에서 사용하자.
  await forceAppActivate(client, group, user.id, (body as any).response_url)
}

export const handleShowDeactivateWarning: Middleware<SlackActionMiddlewareArgs> = async ({
  ack, body, client
}) => {
  const {channel, team, user} = body
  if (!channel || !channel.id) throw new Error('no channel')
  if (!team) throw new Error('no team')
  const trigger_id = (body as any).trigger_id
  if (!trigger_id) throw new Error('No trigger_id')

  await ack()
  const group = await getOrCreateGetGroup(channel.id, team.id, channel.name, team.enterprise_id)
  // TODO: say나 respond를 여기에서 사용하자.
  await showDeactivateWarning(client, trigger_id, group)
}

export const handleForceDeactivate: Middleware<SlackViewMiddlewareArgs> = async ({
  ack, body, client, payload
}) => {
  const {team, user} = body
  const pm = parseWOThrow<TParsedPM>(payload.private_metadata)
  if (!pm) throw new Error('No pm')
  if (!team) throw new Error('no team')

  await ack()
  const group = await getOrCreateGetGroup(pm.channelId, team.id, pm.channelName, team.enterprise_id)
  // TODO: say나 respond를 여기에서 사용하자.
  await forceAppDeactivate(client, group, user.id)
}
