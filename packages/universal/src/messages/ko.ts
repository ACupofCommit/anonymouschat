import { Messages } from "../types/messages"

export const messages: Messages = {
  // posted message
  STR_DELETED_MESSAGE: "삭제된 메시지",
  STR_REPORTED_MESSAGE: "신고된 메시지",

  // maybe dialog
  STR_DIALOG_VOICE_PLACEHOLDER: "사소한 질문도 늘 밝은 미소로 친절히 설명해주시는 OO팀 OO님, 감사합니다 :) 덕분에 이번...",
  STR_PLACEHOLDER_CONTENT_FOR_REPLY: "멋진 의견이네요~ 동의합니다. 특히...",

  STR_DIALOG_FACE_IMOJI: "프로필 이미지",
  STR_DIALOG_FACE_IMOJI_PLACEHOLDER: "프로필 이미지를 선택해주세요",
  STR_DIALOG_NICKNAME_TITLE: "닉네임",
  STR_DIALOG_NICKNAME_PLACEHOLDER: "닉네임을 입력해주세요",
  STR_DIALOG_MESSAGES_TITLE: "메세지",
  STR_DIALOG_PASSWORD_TITLE: "패스워드",
  STR_LABEL_CONTENT: "댓글",
  STR_LABEL_PASSWORD: "패스워드",
  STR_THIS_VOICE_ID: "MessageID: `%s`",
  STR_DIALOG_PASSWORD_PLACEHOLDER: "삭제 시 사용할 Password 를 입력하세요",
  STR_DIALOG_PASSWORD_HINT: "Password 는 메시지 삭제시 필요합니다.",
  STR_FAILED_TO_DELETE_REPLY: "댓글 삭제 실패. Password 를 확인하세요.",
  STR_FAILED_TO_DELETE_VOICE: "메시지 삭제 실패. Password 를 확인하세요.",
  STR_FAILED_TO_CREATE_VOICE: "메시지 작성 실패. 최근 24시간 동안 너무 많은 글이 작성되었습니다.",
  STR_UNKOWN_ERROR: "알 수 없는 에러 발생",
  STR_SUCCESS_VOICE_CREATION: "익명 글 작성 성공. 웹 페이지를 새로고침 합니다",
  STR_INVALID_URL: "유효하지 않은 url 입니다. url 은 수시로 변경 될 수 있으므로 정확한 url 을 확인하세요.",

  STR_TEXT_FOR_CREATION_VOICE: "익명 메시지가 도착했습니다!",

  // agreement
  STR_AGREEMENT_REQUIRED_DESC: `슬랙 앱 사용을 위해 최소 %d 명의 동의가 필요합니다.\n익명으로 *동의* 하거나 실명으로 *활성화* 시킬 수 있습니다`,
  STR_AGREEMENT_ACCEPTED: `%d 명이 동의하여 앱이 활성화 되었습니다.`,
  STR_APP_ACTIVATED_BY_FORCE: `%s 님이 앱을 활성화 시켰습니다.`,
  STR_APP_DEACTIVATED_BY_FORCE: `%s 님이 앱을 비활성화 시켰습니다.`,
  STR_HOW_TO_POST: '이제 `%s` 명령어 또는 ＊Daily web url＊을 사용하여 익명 메시지를 작성 할 수 있습니다!',
  STR_YOU_AREADY_AGREED: "이미 동의 하셨습니다",
  STR_FORCE_ACTIVATE: `즉시 활성화`,
  STR_FORCE_DEACTIVATE: `즉시 비활성화`,

  STR_DEACTIVATE_BUTTON: "비활성화",
  STR_DEACTIVATE_WARNING_MSG: "이 채널에서 *%s* 사용이 중단되고 *%d명의* 사용자 동의 기록이 *리셋* 됩니다. 또한 이 내용은 당신의 실명과 함께 채널에 공유됩니다.\n\n정말 비활성화할까요?",
  STR_DEACTIVATED_NOTI: "{user}님이 ＊{app_name}＊ 사용을 ＊중단＊시켰습니다. ＊{agreed_count}명＊의 유저 동의 기록이 *리셋* 되었습니다. 다시 사용하려면 아래 ＊컨피그 메시지＊를 확인하세요:\n{link}",
  STR_ACTIVATED_NOTI: "{user}님이 ＊{app_name}＊ 사용을 ＊승인＊하였습니다. 아래 ＊컨피그 메시지＊를 참고하세요:\n{link}",

  // app install, permission
  STR_DENIED_APP: `Slack app 사용 승인을 거절하였습니다`,
  STR_ALLOWED_APP: '이제 슬랙앱을 사용할 수 있습니다. 채널에 `%s` 를 입력하세요.',
  STR_QUESTION: `문의 및 버그제보: %s`,
  STR_SERVER_VERSION: '서버 버전: `%s`',
  STR_YOU_HAVE_TO_AGREE_APP_USAGE: `:disappointed_relieved: 익명 메시지를 작성하려면 채널 멤버들의 동의를 받아야 합니다.\n*아래 컨피그 메시지를 참고하세요:*\n%s`,

  STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION1: '슬랙앱이 본 채널의 메시지 작성 권한이 없습니다.',
  STR_SLACK_APP_DOES_NOT_HAVE_PERMISSION2: '아래 url 에 방문하여 권한을 부여 해주세요.',

  STR_LIKE: ':thumbsup:',
  STR_DISLIKE: ':thumbsdown:',
  STR_AGREE: '앱 사용 동의',
  STR_DELETE: '삭제',
  STR_REPLY_AS_ANON: '익명으로 댓글 달기',
  STR_POST_VOICE: '익명 메시지 작성',
  STR_CONFIG_MSG: '컨피그 메시지: %s',
  STR_REPORT: ':rotating_light:신고',
  STR_REPORT_N: ':rotating_light:신고 %d',

  STR_VIEW_TITLE_VOICE_DELETION: '익명 메세지 삭제',
  STR_VIEW_TITLE_REPLY_DELETION: '익명 댓글 삭제',
  STR_VIEW_DELETE: '삭제',
  STR_VIEW_CANCEL: '취소',
  STR_NOT_MATCHED_PASSWORD: '패스워드가 일치하지 않습니다',
  STR_MESSAGE_DELETION: '메시지 삭제',

  P_ADD_APP_AND_RETRY: '↓ 앱 이름을 클릭하여 채널에 앱을 추가한 후 다시 시도해주세요.',
  P_SELECT_CHANNEL: '채널을 선택해 주세요.',
  P_SELECT_CHANNEL_TO_SETTING: '설정을 확인/변경할 채널을 선택해 주세요.',
  P_SELECT_CHANNEL_TO_USE: `%s 앱을 사용 할 채널을 선택하세요.`,

  P_ALLOW_YOU_TO_CHAT: `%s이 선택한 채널에서 익명 대화를 가능하게해줍니다.`,
  P_SETTINGS_ARE_MANAGED_PER_CHANNEL: `%s의 설정은 채널별로 관리됩니다.`,

  P_YOU_CAN_POST: `:point_up_2: 이 버튼을 사용하여 익명 메시지를 작성할 수 있습니다.`,
  P_LANGUAGE_IS: `이미 작성된 메시지 구성 요소의 언어는 변경되지 않으며, 메시지가 업데이트될 때 변경됩니다. (기본설정: 'English')`,

  LABEL_LANGUAGE: `언어`,
  LABEL_REPORT_COUNT_TO_HIDE: `글 숨김을 위한 신고 카운트`,
  P_MESSAGES_THAT_HAVE_ALREADY: `이미 숨김 처리된 메시지는 복원되거나 카운트에 다달은 기존 메시지가 자동으로 숨김 처리 되지 않으며, 이 때 신고 버튼을 클릭하여 메시지를 업데이트하면 적용됩니다.`,
  P_SAVED: `저장되었습니다.`,
  P_REPORT_COUNT_TO_HIDE_MUST_BE: `0 보다 큰 정수여야 합니다.`,

  PLACEHOLDER_SELECT: `선택하세요...`,

  BUTTON_SAVE: `저장`,
  BUTTON_OPEN: `열기`,
  BUTTON_CLOSE: `닫기`,
  BUTTON_START: `시작`,
}
