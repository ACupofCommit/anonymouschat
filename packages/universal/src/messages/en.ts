import { Messages } from "../types/messages"

export const messages: Messages = {
  // posted message
  STR_DELETED_MESSAGE: "Deleted message",
  STR_REPORTED_MESSAGE: "Reported message",

  // maybe dialog
  STR_DIALOG_VOICE_PLACEHOLDER: "Thank you, OO Team OO, who always kindly explains even the many questions with a bright smile :)",
  STR_PLACEHOLDER_CONTENT_FOR_REPLY: "That's a great opinion. I agree. Especially...",

  STR_DIALOG_FACE_IMOJI: "Profile image",
  STR_DIALOG_FACE_IMOJI_PLACEHOLDER: "Select your profile image",
  STR_DIALOG_NICKNAME_TITLE: "Nickname",
  STR_DIALOG_NICKNAME_PLACEHOLDER: "Input your nickname",
  STR_DIALOG_MESSAGES_TITLE: "Message",
  STR_DIALOG_PASSWORD_TITLE: "Password",
  STR_LABEL_CONTENT: "Comment",
  STR_LABEL_PASSWORD: "Password",
  STR_THIS_VOICE_ID: "MessageID: `%s`",
  STR_DIALOG_PASSWORD_PLACEHOLDER: "Input password to be used to delete the message later.",
  STR_DIALOG_PASSWORD_HINT: "Password is required when deleting messages.",
  STR_FAILED_TO_DELETE_REPLY: "Failed to delete comment. Check your Password.",
  STR_FAILED_TO_DELETE_VOICE: "Failed to delete message. Check your Password.",
  STR_FAILED_TO_CREATE_VOICE: "Failed to write message. Too many posts have been written in the last 24 hours.",
  STR_UNKOWN_ERROR: "Unknown error",
  STR_SUCCESS_VOICE_CREATION: "Successfully written anonymous post. Refresh the web page.",
  STR_INVALID_URL: "Invalid url. The url may change periodically, so please check the correct url.",

  STR_TEXT_FOR_CREATION_VOICE: "Anonymous message has arrived!",

  // agreement
  STR_AGREEMENT_REQUIRED_DESC: `A minimum of %d consent is required to use the Slack app.\nYou can *consent* anonymously or *enable* with your real name.`,
  STR_AGREEMENT_ACCEPTED: `The app has been activated with the consent of %d members.`,
  STR_APP_ACTIVATED_BY_FORCE: `%s has activated the app.`,
  STR_APP_DEACTIVATED_BY_FORCE: `%s has deactivated the app.`,
  STR_HOW_TO_POST: 'Now you can post anonymous messages using `%s` command or ＊Daily web url＊!',
  STR_YOU_AREADY_AGREED: "you already agreed.",
  STR_FORCE_ACTIVATE: `Activate immediately`,
  STR_FORCE_DEACTIVATE: `Deactivate immediately`,

  STR_DEACTIVATE_BUTTON: "Deactivate",
  STR_DEACTIVATE_WARNING_MSG: "*%s* will be deprecated on this channel and *%d* users consent records will be *reset*. Also, this behavior will be shared on the channel with your real name.\n\nAre you sure you want to deactivate it?",
  STR_DEACTIVATED_NOTI: "{user} has *discontinued* use of ＊{app_name}＊. The user consent record of ＊{agreed_count} people＊ has been *reset*. To use it again, please check the ＊config message＊ below:\n{link}",
  STR_ACTIVATED_NOTI: "The use of ＊{app_name}＊ has been ＊approved＊ by {user}. Please refer to the ＊Config Message＊ below:\n{link}",

  // app install, permission
  STR_DENIED_APP: `You declined permission to use the Slack app`,
  STR_ALLOWED_APP: 'You can now use the Slack app. Enter `%s` in your channel.',
  STR_QUESTION: `Inquiries and bug reports: %s`,
  STR_SERVER_VERSION: 'Server version: `%s`',
  STR_YOU_HAVE_TO_AGREE_APP_USAGE: `:disappointed_relieved: To post an anonymous message, it need the consent of the channel members.\n*Please refer to the config message below:*\n%s`,

  STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION1: 'Slack app does not have permission to write messages on this channel.',
  STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION2: 'Please visit the url below and grant permission.',

  STR_LIKE: ':thumbsup:',
  STR_DISLIKE: ':thumbsdown:',
  STR_AGREE: 'Agree to use',
  STR_DELETE: 'Delete',
  STR_REPLY_AS_ANON: 'Comment anonymously',
  STR_POST_VOICE: 'Post anonymous messages',
  STR_CONFIG_MSG: 'Config message: %s',
  STR_REPORT: ':rotating_light:Report',
  STR_REPORT_N: ':rotating_light:Report %d',

  STR_VIEW_TITLE_VOICE_DELETION: 'Delete a message',
  STR_VIEW_TITLE_REPLY_DELETION: 'Delete a comment',
  STR_VIEW_DELETE: 'Delete',
  STR_VIEW_CANCEL: 'Cancel',
  STR_NOT_MATCHED_PASSWORD: 'Passwords do not match.',
  STR_MESSAGE_DELETION: 'Delete message',

  P_ADD_APP_AND_RETRY: '↓ Click the app name to add the app to the channel and try again.',
  P_SELECT_CHANNEL: 'Select a channel.',
  P_SELECT_CHANNEL_TO_SETTING: 'Please select a channel to check/change settings.',
  P_SELECT_CHANNEL_TO_USE: `Please select a channel to use the %s`,

  P_ALLOW_YOU_TO_CHAT: `%s allows you to chat anonymously on the selected channel.`,
  P_SETTINGS_ARE_MANAGED_PER_CHANNEL: `%s's settings are managed per channel.`,

  P_YOU_CAN_POST: `:point_up_2: You can use this button to post an anonymous message.`,
  P_LANGUAGE_IS: `The language of an already written message component does not change, it changes when the message is updated. (Default: 'English')`,

  LABEL_LANGUAGE: `Language`,
  LABEL_REPORT_COUNT_TO_HIDE: `Report count for hiding message`,
  P_MESSAGES_THAT_HAVE_ALREADY: `Messages that have already been hidden will not be restored, and existing messages that have reached the count will not be automatically hidden, then click the report button to update the message and it will take effect.`,
  P_SAVED: `Saved.`,
  P_REPORT_COUNT_TO_HIDE_MUST_BE: `It must be an integer greater than zero.`,

  PLACEHOLDER_SELECT: `Select...`,

  BUTTON_SAVE: `Save`,
  BUTTON_OPEN: `Open`,
  BUTTON_CLOSE: `Close`,
  BUTTON_START: `Start`,
}
