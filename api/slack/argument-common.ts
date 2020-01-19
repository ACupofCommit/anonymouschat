import { Option, InputBlock, ViewsOpenArguments, SectionBlock } from '@slack/web-api'
import sillyname from 'sillyname'
import { IFaceImoji, IPMDeletionView } from '../../types/type-common'
import { getFaceImojiList, getRawPassword } from '../../common/common-util'
import { INPUT_FACE_IMOJI, INPUT_NAME_NICKNAME, nickname_min_length, nickname_max_length, INPUT_NAME_CONTENT, INPUT_NAME_PASSWORD, password_min_length, password_max_length, ACTION_SUBMISSION_DELETE, NOT_YET } from '../constant'
import { STR_DIALOG_FACE_IMOJI, STR_DIALOG_FACE_IMOJI_PLACEHOLDER, STR_DIALOG_NICKNAME_PLACEHOLDER, STR_DIALOG_NICKNAME_TITLE, STR_DIALOG_PASSWORD_PLACEHOLDER, STR_DIALOG_PASSWORD_TITLE, STR_DIALOG_PASSWORD_HINT, STR_VIEW_TITLE_REPLY_DELETION, STR_VIEW_TITLE_VOICE_DELETION, STR_VIEW_DELETE, STR_VIEW_CANCEL, STR_REPORTED_MESSAGE, STR_DELETED_MESSAGE, STR_THIS_VOICE_ID } from '../strings'
import { IVoice, isVoice } from '../../types/type-voice'
import { IReply } from '../../types/type-reply'
import { isReplyByTsThreadTs } from '../util'

const ANONYMOUSLACK_ENV = process.env.ANONYMOUSLACK_ENV

export const getContent = (obj: IVoice | IReply) => {
  const { isHiddenByReport, isDeleted, content } = obj

  let modifiedContent =
      isHiddenByReport ? STR_REPORTED_MESSAGE
    : isDeleted        ? STR_DELETED_MESSAGE
    : content

  if (isVoice(obj) && obj.platformId !== NOT_YET) {
    modifiedContent = modifiedContent + '\n\n' + STR_THIS_VOICE_ID.replace('%s', obj.platformId)
  }

  if (ANONYMOUSLACK_ENV !== 'production') {
    modifiedContent = `
(test용 슬랙앱에서 작성된 메시지 입니다)
${modifiedContent}
`.trim()
  }

  return modifiedContent
}


const getEmojiOption = (f: IFaceImoji): Option => {
  return {
    "value": f.value,
    "text": { "type": "plain_text", "text": f.label, "emoji": true },
  }
}

export const getInputFaceImojiBlock = (): InputBlock => {
  const faceImojiList = getFaceImojiList()
  const found = faceImojiList.find(f => f.value === ':grinning:')
  const initiaOption = found && getEmojiOption(found)

  return {
    block_id: INPUT_FACE_IMOJI,
    "type": "input",
    "label": { "type": "plain_text", "text": STR_DIALOG_FACE_IMOJI, "emoji": true },
    "element": {
      action_id: 'so',
      "type": "static_select",
      "placeholder": { "type": "plain_text", "text": STR_DIALOG_FACE_IMOJI_PLACEHOLDER, "emoji": true },
      initial_option: initiaOption,
      "options": faceImojiList.map(getEmojiOption),
    }
  }
}
export const getInputNicknameBlock = (): InputBlock => {
  return {
    "type": "input",
    "block_id" : INPUT_NAME_NICKNAME,
    "element": {
      action_id: 's',
      "type": "plain_text_input",
      "initial_value": sillyname().split(' ')[0],
      "min_length": nickname_min_length,
      "max_length": nickname_max_length,
      "placeholder": { "type": "plain_text", "text": STR_DIALOG_NICKNAME_PLACEHOLDER, "emoji": true },
    },
    "label": { "type": "plain_text", "text": STR_DIALOG_NICKNAME_TITLE, "emoji": true },
  }
}
export const getInputContentBlock = (label: string, placeholder: string): InputBlock => {
  return {
    "type": "input",
    "block_id": INPUT_NAME_CONTENT,
    "element": {
      action_id: 's',
      "type": "plain_text_input",
      "multiline": true,
      "placeholder": { "type": "plain_text", "text": placeholder, "emoji": true },
    },
    "label": { "type": "plain_text", "text": label, "emoji": true },
  }
}

export const getInputPasswordBlock = (): InputBlock => {
  return {
    "type": "input",
    "block_id": INPUT_NAME_PASSWORD,
    "element": {
      action_id: 's',
      "type": "plain_text_input",
      "initial_value": getRawPassword(),
      "min_length": password_min_length,
      "max_length": password_max_length,
      "placeholder": { "type": "plain_text", "text": STR_DIALOG_PASSWORD_PLACEHOLDER, "emoji": true },
    },
    "label": { "type": "plain_text", "text": STR_DIALOG_PASSWORD_TITLE, "emoji": true },
    "hint": { "type": "plain_text", "text": STR_DIALOG_PASSWORD_HINT, "emoji": true },
  }
}

export const getDeletionViewOpenArg = (trigger_id: string, pm: IPMDeletionView): ViewsOpenArguments => {
  const { ts, threadTs } = pm
  const title = isReplyByTsThreadTs(ts, threadTs) ? STR_VIEW_TITLE_REPLY_DELETION : STR_VIEW_TITLE_VOICE_DELETION
  return {
    trigger_id,
    view: {
      private_metadata: JSON.stringify(pm),
      "callback_id": ACTION_SUBMISSION_DELETE,
      "type": "modal",
      "title": { "type": "plain_text", "text": title, "emoji": true },
      "submit": { "type": "plain_text", "text": STR_VIEW_DELETE, "emoji": true },
      "close": { "type": "plain_text", "text": STR_VIEW_CANCEL, "emoji": true },
      blocks: [
        {
          "type": "input",
          "block_id" : INPUT_NAME_PASSWORD,
          "element": {
            action_id: 's',
            "type": "plain_text_input",
            "min_length": password_min_length,
            "max_length": password_max_length,
            "placeholder": { "type": "plain_text", "text": 'password', "emoji": true },
          },
          "label": { "type": "plain_text", "text": STR_DIALOG_PASSWORD_TITLE, "emoji": true },
        }
      ]
    }
  }
}

export const getErrorMsgBlockInView = (msg: string) => {
  const sectionBlock: SectionBlock = {
    "type": "section",
    "text": { type: "plain_text", text: ':warning: ' + msg, emoji: true }
  }
  return sectionBlock
}
