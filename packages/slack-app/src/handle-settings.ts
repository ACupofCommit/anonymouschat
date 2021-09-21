import { Middleware, SlackShortcutMiddlewareArgs, SlackViewMiddlewareArgs} from "@slack/bolt"
import { getChannelSettingView, getSaved, getSelectingChannelToChannelSettings } from '@anonymouslack/universal/dist/core'
import { IGroup, isGroup, isWebAPIPlatformError, ResponseUrl } from "@anonymouslack/universal/dist/types"
import { Messages } from "@anonymouslack/universal/dist/types/messages"
import to from "await-to-js"
import { WebAPIPlatformError } from "@slack/web-api"
import { BLOCK_CHANNEL_CONFIG_REPORT_COUNT_TO_HIDE_MESSAGE, putGroup } from "@anonymouslack/universal/dist/models"

export const handleShortcutChannelSettings: Middleware<SlackShortcutMiddlewareArgs> = async ({body,ack,client, context}) => {
  await ack()
  const {trigger_id} = body
  const {messages: m} = context

  const bot = await client.auth.test()
  if (typeof bot.user_id !== 'string') throw new Error('Can not get bot.user_id')

  const viewOpenArg = getSelectingChannelToChannelSettings(m, trigger_id, bot.user_id)
  await client.views.open(viewOpenArg)
}

export const handleSubmitChannelSettings: Middleware<SlackViewMiddlewareArgs> = async ({body, ack, client, context}) => {
  console.log('handleSubmitChannelSettings')
  const m = context.messages as Messages
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

  const group = context.group as IGroup
  return await ack({
    response_action: 'update',
    view: getChannelSettingView({ channelId: group.channelId }, group),
  })
}

export const handleSubmitSaveChannelSetting: Middleware<SlackViewMiddlewareArgs> = async ({body, ack, client, context}) => {
  const m = context.messages as Messages
  const lca2 = (body.view.state.values as any).BLOCK_CHANNEL_CONFIG_LCA2.ACTION_LCA2.selected_option.value
  const reportCountToHideMessage = Number((body.view.state.values as any).BLOCK_CHANNEL_CONFIG_REPORT_COUNT_TO_HIDE_MESSAGE.ACTION_REPORT_COUNT_TO_HIDE_MESSAGE.value)
  if (isNaN(reportCountToHideMessage) || reportCountToHideMessage < 1 || !isFinite(reportCountToHideMessage)) {
    return await ack({
      response_action: 'errors',
      errors: {
        [BLOCK_CHANNEL_CONFIG_REPORT_COUNT_TO_HIDE_MESSAGE]: m.P_REPORT_COUNT_TO_HIDE_MUST_BE,
      },
    })
  }

  const group = context.group
  if (isGroup(group)) {
    await putGroup({ ...group, lca2: lca2, numberOfReportToHidden: reportCountToHideMessage })
  }

  return await ack({
    response_action: 'update',
    view: getSaved(body.view.private_metadata as any),
  })
}
