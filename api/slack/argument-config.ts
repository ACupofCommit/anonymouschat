import { compact } from 'lodash'

import { ChatPostMessageArguments, ChatPostEphemeralArguments, KnownBlock } from '@slack/web-api'
import { ACTION_APP_USE_AGREEMENT, ACTIVATION_QUORUM, NOT_YET, ACTION_APP_FORCE_ACTIVATE, ACTION_APP_FORCE_DEACTIVATE } from '../constant'
import { STR_AGREEMENT_REQUIRED_DESC, STR_YOU_AREADY_AGREED, STR_AGREEMENT_ACCEPTED, STR_SHARE_AGREEMENT_LINK, STR_FORCE_ACTIVATE, STR_AGREE, STR_APP_ACTIVATED_BY_FORCE, STR_APP_DEACTIVATED_BY_FORCE, STR_FORCE_DEACTIVATE, STR_POST_VOICE, STR_YOU_HAVE_TO_AGREE_APP_USAGE, STR_HOW_TO_POST, STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION1, STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION2, STR_CONFIG_MSG, STR_QUESTION, STR_SERVER_VERSION } from '../strings'
import { IGroup } from '../../types/type-group'
import { getUrlToPostVoice } from '../util'

const ANONYMOUSLACK_MANAGER_SLACK_ID = process.env.ANONYMOUSLACK_MANAGER_SLACK_ID
const GIT_REVISION = process.env.GIT_REVISION

export const getHelpMessageArg = (channel: string, user: string, configMsgPermalink: string, isActivated: boolean): ChatPostEphemeralArguments => {
  const strYouHaveTo = STR_YOU_HAVE_TO_AGREE_APP_USAGE.replace('%s', configMsgPermalink)
  const strConfigMsg = '-' + STR_CONFIG_MSG.replace('%s', configMsgPermalink)
  const strQuestion = '-' + STR_QUESTION.replace('%s', `<@${ANONYMOUSLACK_MANAGER_SLACK_ID}>`)
  const strServerVersion = '-' + STR_SERVER_VERSION.replace('%s',GIT_REVISION || '')

  return {
    text: '',
    channel,
    user,
    as_user: false,
    blocks: compact<KnownBlock>([
      !isActivated && { "type": "section", "text": { "type": "mrkdwn", "text": strYouHaveTo }},
      ANONYMOUSLACK_MANAGER_SLACK_ID && { "type": "section", "text": { "type": "mrkdwn", "text": strQuestion }},
      isActivated && { "type": "section", "text": { "type": "mrkdwn", "text": strConfigMsg }},
      GIT_REVISION && { "type": "section", "text": { "type": "mrkdwn", "text": strServerVersion }},
    ])
  }
}

export const getAlreadyAgreedMessageArg = (channel: string, user: string): ChatPostEphemeralArguments => {
  return {
    text: STR_YOU_AREADY_AGREED,
    channel,
    user,
    as_user: false,
    attachments: []
  }
}

const getActivatedConfigMsgBlocks = (group: IGroup): KnownBlock[] => {
  const { agreedUserArr, forceActivateUserId } = group
  const strAgreeButton = agreedUserArr.length === 0 ? STR_AGREE : `${STR_AGREE} (${agreedUserArr.length}/${ACTIVATION_QUORUM})`

  const isMeetQuorum = agreedUserArr.length >= ACTIVATION_QUORUM
  const strActivatedByAgreeUsers = STR_AGREEMENT_ACCEPTED.replace("%d", ""+agreedUserArr.length)
  const strActivatedByForce = STR_APP_ACTIVATED_BY_FORCE.replace('%s', `<@${forceActivateUserId}>`)

  const reasonOfActivated = isMeetQuorum ? strActivatedByAgreeUsers : strActivatedByForce
  const description = [reasonOfActivated, STR_HOW_TO_POST].join(' ')

  return [
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": strAgreeButton, "emoji": true },
          value: ACTION_APP_USE_AGREEMENT,
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": STR_FORCE_DEACTIVATE, "emoji": true },
          "style": "danger",
          "value": ACTION_APP_FORCE_DEACTIVATE,
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
  const strAgreeButton = agreedUserArr.length === 0 ? STR_AGREE : `${STR_AGREE} (${agreedUserArr.length}/${ACTIVATION_QUORUM})`
  const strDeactivatedByForce = STR_APP_DEACTIVATED_BY_FORCE.replace('%s', `<@${forceDeactivateUserId}>`)

  return compact([
    forceDeactivateUserId !== NOT_YET && {
      "type": "section",
      "text": { "type": "mrkdwn", "text": strDeactivatedByForce },
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": STR_AGREEMENT_REQUIRED_DESC.replace("%d", ""+ACTIVATION_QUORUM)},
    },
    {
      "type": "actions",
      "elements": compact([
        {
          "type": "button",
          "text": { "type": "plain_text", "text": strAgreeButton, "emoji": true },
          "style": "primary",
          value: ACTION_APP_USE_AGREEMENT,
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": STR_FORCE_ACTIVATE, "emoji": true },
          "style": "danger",
          "value": ACTION_APP_FORCE_ACTIVATE,
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
    as_user: false,
    blocks,
  }
}

export const getMemberAgreementLinkArg = (channelId: string, userId: string, permalink: string): ChatPostEphemeralArguments => {
  const text = STR_SHARE_AGREEMENT_LINK.replace("%link", permalink)
  return { text, user: userId, channel: channelId, as_user: false, unfurl_links: true }
}

export const getErrorMsgChannelNotFound = () => {
  return [
    STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION1,
    STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION2,
    process.env.ANONYMOUSLACK_SHARABLE_URL,
  ].join('\n')
}
