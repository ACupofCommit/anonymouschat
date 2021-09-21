import { compact, omit } from 'lodash'
import { ChatPostMessageArguments, ChatPostEphemeralArguments, KnownBlock, ViewsOpenArguments, ViewsUpdateArguments } from '@slack/web-api'
import { ACTION_APP_USE_AGREEMENT, ACTIVATION_QUORUM, NOT_YET, ACTION_APP_FORCE_ACTIVATE, ACTION_OPEN_DIALOG_VOICE, CONST_SLASH_COMMAND, ACTION_SHOW_DEACTIVATE_WARNING, ACTION_SUBMISSION_INIT, CONST_APP_NAME } from '../models'
import { IGroup } from '../types/type-group'
import { getUrlToPostVoice } from '../utils/common.util'
import { Messages } from '../types/messages'
import { getMessageFromChannelId } from './nls'

const ANONYMOUSLACK_MANAGER_SLACK_ID = process.env.ANONYMOUSLACK_MANAGER_SLACK_ID
const GIT_REVISION = process.env.GIT_REVISION

export const getHelpMessageArg = (channelId: string, user: string, configMsgPermalink: string, isActivated: boolean): ChatPostEphemeralArguments => {
  const m = getMessageFromChannelId(channelId)

  const strYouHaveTo = m.STR_YOU_HAVE_TO_AGREE_APP_USAGE.replace('%s', configMsgPermalink)

  const buttonPointDesc = `:point_up_2: 이 버튼을 사용하여 익명 메시지를 작성할 수 있습니다.`
  const strConfigMsg = '-' + m.STR_CONFIG_MSG.replace('%s', configMsgPermalink)
  const strQuestion = '-' + m.STR_QUESTION.replace('%s', `<@${ANONYMOUSLACK_MANAGER_SLACK_ID}>`)
  const strServerVersion = '-' + m.STR_SERVER_VERSION.replace('%s',GIT_REVISION || '')
  const descForAlreadyActivated = [buttonPointDesc, strConfigMsg].join('\n\n')

  return {
    text: '',
    channel: channelId,
    user,
    blocks: compact<KnownBlock>([
      !isActivated && { "type": "section", "text": { "type": "mrkdwn", "text": strYouHaveTo }},
      isActivated && {
        "type": "actions",
        "elements": [
          {
            action_id: ACTION_OPEN_DIALOG_VOICE,
            "type": "button",
            "text": { "type": "plain_text", "text": m.STR_POST_VOICE, "emoji": true },
            "style": "primary",
          }
        ]
      },
      ANONYMOUSLACK_MANAGER_SLACK_ID && { "type": "section", "text": { "type": "mrkdwn", "text": strQuestion }},
      isActivated && { "type": "section", "text": { "type": "mrkdwn", "text": descForAlreadyActivated }},
      GIT_REVISION && { "type": "section", "text": { "type": "mrkdwn", "text": strServerVersion }},
    ])
  }
}

export const getAlreadyAgreedMessageArg = (channelId: string, user: string): ChatPostEphemeralArguments => {
  const m = getMessageFromChannelId(channelId)
  return {
    text: m.STR_YOU_AREADY_AGREED,
    channel: channelId,
    user,
    attachments: []
  }
}

export const getActivatedConfigMsgBlocks = (group: IGroup): KnownBlock[] => {
  const { agreedUserArr, forceActivateUserId } = group
  const m = getMessageFromChannelId(group.channelId)
  const strAgreeButton = agreedUserArr.length === 0 ? m.STR_AGREE : `${m.STR_AGREE} (${agreedUserArr.length}/${ACTIVATION_QUORUM})`

  const isMeetQuorum = agreedUserArr.length >= ACTIVATION_QUORUM
  const strActivatedByAgreeUsers = m.STR_AGREEMENT_ACCEPTED.replace("%d", ""+agreedUserArr.length)
  const strActivatedByForce = m.STR_APP_ACTIVATED_BY_FORCE.replace('%s', `<@${forceActivateUserId}>`)

  const reasonOfActivated = isMeetQuorum ? strActivatedByAgreeUsers : strActivatedByForce
  const strHowToPost = m.STR_HOW_TO_POST.replace('%s', CONST_SLASH_COMMAND)
  const description = [':tada:', reasonOfActivated, strHowToPost].join(' ')

  return [
    {
      "type": "actions",
      "elements": [
        {
          action_id: ACTION_OPEN_DIALOG_VOICE,
          "type": "button",
          "text": { "type": "plain_text", "text": m.STR_POST_VOICE, "emoji": true },
          "style": "primary",
        },
        {
          action_id: ACTION_APP_USE_AGREEMENT,
          "type": "button",
          "text": { "type": "plain_text", "text": strAgreeButton, "emoji": true },
        },
        {
          action_id: ACTION_SHOW_DEACTIVATE_WARNING,
          type: "button",
          text: { "type": "plain_text", "text": m.STR_FORCE_DEACTIVATE, "emoji": true },
          style: "danger",
        },
      ]
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": `*Daily web url*: ${getUrlToPostVoice(group.webAccessToken)}` },
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": description },
    },
  ]
}

const getDeactivatedConfigMsgBlocks = (group: IGroup): KnownBlock[] => {
  const { forceDeactivateUserId, agreedUserArr } = group
  const m = getMessageFromChannelId(group.channelId)
  const strAgreeButton = agreedUserArr.length === 0 ? m.STR_AGREE : `${m.STR_AGREE} (${agreedUserArr.length}/${ACTIVATION_QUORUM})`
  const strDeactivatedByForce = m.STR_APP_DEACTIVATED_BY_FORCE.replace('%s', `<@${forceDeactivateUserId}>`)

  return compact([
    forceDeactivateUserId !== NOT_YET && {
      "type": "section",
      "text": { "type": "mrkdwn", "text": strDeactivatedByForce },
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": m.STR_AGREEMENT_REQUIRED_DESC.replace("%d", ""+ACTIVATION_QUORUM)},
    },
    {
      "type": "actions",
      "elements": compact([
        {
          action_id: ACTION_APP_USE_AGREEMENT,
          "type": "button",
          "text": { "type": "plain_text", "text": strAgreeButton, "emoji": true },
          "style": "primary",
        },
        {
          action_id: ACTION_APP_FORCE_ACTIVATE,
          type: "button",
          text: { "type": "plain_text", "text": m.STR_FORCE_ACTIVATE, "emoji": true },
          style: "danger",
        },
      ])
    },
  ])
}

export const getConfigMsgArg = (group: IGroup): ChatPostMessageArguments => {
  const { channelId, isPostingAvailable } = group
  const blocks = isPostingAvailable
    ? getActivatedConfigMsgBlocks(group)
    : getDeactivatedConfigMsgBlocks(group)

  return {
    text: '',
    channel: channelId,
    blocks,
    attachments: [],
  }
}

export const getErrorMsgChannelNotFound = (m: Messages) => {
  return [
    m.STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION1,
    m.STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION2,
    process.env.ANONYMOUSLACK_SHARABLE_URL,
  ].join('\n')
}

export const getSelectingChannelToInitialView = (m: Messages, trigger_id: string, botUserId: string): ViewsOpenArguments => {
  return {
    trigger_id,
    view: {
      // private_metadata: JSON.stringify(pm),
      "callback_id": ACTION_SUBMISSION_INIT,
      "type": "modal",
      "title": { "type": "plain_text", "text": CONST_APP_NAME, "emoji": true },
      "submit": { "type": "plain_text", "text": "Start", "emoji": true  },
      "close": { "type": "plain_text", "text": "Cancel", "emoji": true },
      "blocks": [
        {
          "block_id": "target_channel",
          "type": "input",
          "optional": true,
          "label": {
            "type": "plain_text",
            "text":  m.P_SELECT_CHANNEL_TO_USE.replace("%s", CONST_APP_NAME),
          },
          "element": {
            "action_id": "target_select",
            "type": "conversations_select",
            default_to_current_conversation: true,
            response_url_enabled: true,
            filter: {
              exclude_bot_users: true,
              exclude_external_shared_channels: true,
              // 보안이 취약한 public 채널에 익명의 누군가가
              // 악의적인 행동 정보(유출 or 타인 비방)을 할 수 있으므로
              // private 채널만 지원한다.
              // 추후에는 관리자가 선택할 수 있도록 제공하면 좋겠다.
              include: ['private'],
            },
          },
        },
        {
          "block_id": "guide_message",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": m.P_ALLOW_YOU_TO_CHAT.replace("%s", `<@${botUserId}>`),
          },
        },
      ]
    }
  }
}

export const getSelectingChannelToChannelSettings = (m: Messages, trigger_id: string, botUserId: string): ViewsOpenArguments => {
  return {
    trigger_id,
    view: {
      // private_metadata: JSON.stringify(pm),
      "callback_id": ACTION_SUBMISSION_INIT,
      "type": "modal",
      "title": { "type": "plain_text", "text": CONST_APP_NAME, "emoji": true },
      "submit": { "type": "plain_text", "text": "Start", "emoji": true  },
      "close": { "type": "plain_text", "text": "Cancel", "emoji": true },
      "blocks": [
        {
          "block_id": "target_channel",
          "type": "input",
          "optional": true,
          "label": {
            "type": "plain_text",
            "text":  m.P_SELECT_CHANNEL_TO_SETTING,
          },
          "element": {
            "action_id": "target_select",
            "type": "conversations_select",
            default_to_current_conversation: true,
            response_url_enabled: true,
            filter: {
              exclude_bot_users: true,
              exclude_external_shared_channels: true,
              // 보안이 취약한 public 채널에 익명의 누군가가
              // 악의적인 행동 정보(유출 or 타인 비방)을 할 수 있으므로
              // private 채널만 지원한다.
              // 추후에는 관리자가 선택할 수 있도록 제공하면 좋겠다.
              include: ['private'],
            },
          },
        },
      ]
    }
  }
}
