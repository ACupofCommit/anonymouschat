import sinon from 'sinon'
import { isMoreActionPayload, isMyBlockActionPayload, isMyViewSubmissionPayload } from './model/model-common'

const viewSubmissionPayload = {
  "type": "view_submission",
  "team": {
    "id": "TD27NGKRD",
    "domain": "aluc-io"
  },
  "user": {
    "id": "UD2GNPF1U",
    "username": "b6pzeusbc54tvhw5jgpyw",
    "name": "b6pzeusbc54tvhw5jgpyw",
    "team_id": "TD27NGKRD"
  },
  "api_app_id": "AMFUU7QH3",
  "token": "HSxxxxxxxxxxxxxxxxxxAz6r",
  "trigger_id": "1045449201559.444260563863.e56835161567783da914204149e5fcd2",
  "view": {
    "id": "V0117F85ZGS",
    "team_id": "TD27NGKRD",
    "type": "modal",
    "blocks": [
      {
        "type": "input",
        "block_id": "select_face_imoji",
        "label": {
          "type": "plain_text",
          "text": "프로필 이미지",
          "emoji": true
        },
        "optional": false,
        "element": {
          "type": "static_select",
          "action_id": "so",
          "placeholder": {
            "type": "plain_text",
            "text": "프로필 이미지를 선택해주세요",
            "emoji": true
          },
          "initial_option": {
            "text": {
              "type": "plain_text",
              "text": "😀 grinning",
              "emoji": true
            },
            "value": ":grinning:"
          },
          "options": [
            { "text": { "type": "plain_text", "text": "😁 grin", "emoji": true }, "value": ":grin:" },
            { "text": { "type": "plain_text", "text": "😂 joy", "emoji": true }, "value": ":joy:" },
            { "text": { "type": "plain_text", "text": "🙋 raising_hand", "emoji": true }, "value": ":raising_hand:" },
            { "text": { "type": "plain_text", "text": "😀 grinning", "emoji": true }, "value": ":grinning:" },
            { "text": { "type": "plain_text", "text": "😇 innocent", "emoji": true }, "value": ":innocent:" },
            // ...
          ]
        }
      },
      {
        "type": "input",
        "block_id": "messagebox_nickname",
        "label": {
          "type": "plain_text",
          "text": "닉네임",
          "emoji": true
        },
        "optional": false,
        "element": {
          "type": "plain_text_input",
          "action_id": "s",
          "placeholder": {
            "type": "plain_text",
            "text": "닉네임을 입력해주세요",
            "emoji": true
          },
          "initial_value": "Deephornet",
          "min_length": 1,
          "max_length": 20
        }
      },
      {
        "type": "input",
        "block_id": "messagebox_content",
        "label": {
          "type": "plain_text",
          "text": "메세지",
          "emoji": true
        },
        "optional": false,
        "element": {
          "type": "plain_text_input",
          "action_id": "s",
          "placeholder": {
            "type": "plain_text",
            "text": "사소한 질문도 늘 밝은 미소로 친절히 설명해주시는 OO팀 OO님, 감사합니다 :) 덕분에 이번...",
            "emoji": true
          },
          "multiline": true
        }
      },
      {
        "type": "input",
        "block_id": "messagebox_password",
        "label": {
          "type": "plain_text",
          "text": "패스워드",
          "emoji": true
        },
        "hint": {
          "type": "plain_text",
          "text": "Password 는 메시지 삭제시 필요합니다.",
          "emoji": true
        },
        "optional": false,
        "element": {
          "type": "plain_text_input",
          "action_id": "s",
          "placeholder": {
            "type": "plain_text",
            "text": "삭제 시 사용할 Password 를 입력하세요",
            "emoji": true
          },
          "initial_value": "bNhkf4EpsgFtXXnY",
          "min_length": 4,
          "max_length": 30
        }
      }
    ],
    "private_metadata": "{\"channelId\":\"C01181FJSD9\",\"channelName\":\"deleteme\"}",
    "callback_id": "ACTION_SUBMISSION_VOICE",
    "state": {
      "values": {
        "select_face_imoji": {
          "so": {
            "type": "static_select",
            "selected_option": {
              "text": {
                "type": "plain_text",
                "text": "😀 grinning",
                "emoji": true
              },
              "value": ":grinning:"
            }
          }
        },
        "messagebox_nickname": {
          "s": {
            "type": "plain_text_input",
            "value": "Deephornet"
          }
        },
        "messagebox_password": {
          "s": {
            "type": "plain_text_input",
            "value": "bNhkf4EpsgFtXXnY"
          }
        },
        "messagebox_content": {
          "s": {
            "type": "plain_text_input",
            "value": "hhhhhh"
          }
        }
      }
    },
    "hash": "1586195601.4e55bd0f",
    "title": {
      "type": "plain_text",
      "text": "aluc-app",
      "emoji": true
    },
    "clear_on_close": false,
    "notify_on_close": false,
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "submit": {
      "type": "plain_text",
      "text": "Post",
      "emoji": true
    },
    "previous_view_id": null,
    "root_view_id": "V0117F85ZGS",
    "app_id": "AMFUU7QH3",
    "external_id": "",
    "app_installed_team_id": "TD27NGKRD",
    "bot_id": "BSXLDFF8V"
  },
  "response_urls": []
}

const blockActionPayload = {
  "type": "block_actions",
  "user": {
    "id": "UD2GNPF1U",
    "username": "b6pzeusbc54tvhw5jgpyw",
    "name": "b6pzeusbc54tvhw5jgpyw",
    "team_id": "TD27NGKRD"
  },
  "api_app_id": "AMFUU7QH3",
  "token": "HSxxxxxxxxxxxxxxxxxxxx6r",
  "container": {
    "type": "message",
    "message_ts": "1586185743.001200",
    "channel_id": "C01181FJSD9",
    "is_ephemeral": false
  },
  "trigger_id": "1042636477683.444260563863.af2047880133ac22052d67bbff3e0f4b",
  "team": {
    "id": "TD27NGKRD",
    "domain": "aluc-io"
  },
  "channel": {
    "id": "C01181FJSD9",
    "name": "deleteme"
  },
  "message": {
    "type": "message",
    "subtype": "bot_message",
    "text": "This content can't be displayed.",
    "ts": "1586185743.001200",
    "username": "anonymouslack-local",
    "bot_id": "BSXLDFF8V",
    "blocks": [
      {
        "type": "section",
        "block_id": "iBa",
        "text": {
          "type": "mrkdwn",
          "text": "슬랙 앱 사용을 위해 최소 3 명의 동의가 필요합니다.\n익명으로 *동의* 하거나 실명으로 *활성화* 시킬 수 있습니다",
          "verbatim": false
        }
      },
      {
        "type": "actions",
        "block_id": "9dSjG",
        "elements": [
          {
            "type": "button",
            "action_id": "9++",
            "text": {
              "type": "plain_text",
              "text": "앱 사용 동의",
              "emoji": true
            },
            "style": "primary",
            "value": "ACTION_APP_USE_AGREEMENT"
          },
          {
            "type": "button",
            "action_id": "30J3V",
            "text": {
              "type": "plain_text",
              "text": "즉시 활성화",
              "emoji": true
            },
            "style": "danger",
            "value": "ACTION_APP_FORCE_ACTIVATE"
          }
        ]
      }
    ]
  },
  "response_url": "https://hooks.slack.com/actions/TD27NGKRD/1042636477379/wdoCZaXzwyYsCuEDSD8WJxw1",
  "actions": [
    {
      "action_id": "9++",
      "block_id": "9dSjG",
      "text": {
        "type": "plain_text",
        "text": "앱 사용 동의",
        "emoji": true
      },
      "value": "ACTION_APP_USE_AGREEMENT",
      "style": "primary",
      "type": "button",
      "action_ts": "1586195378.178812"
    }
  ]
}

const moreActionPayload = {
  "type": "message_action",
  "token": "HSxxxxxxxxxxxxxxxxxxxx6r",
  "action_ts": "1586193980.395724",
  "team": {
    "id": "TD27NGKRD",
    "domain": "aluc-io"
  },
  "user": {
    "id": "UD2GNPF1U",
    "name": "b6pzeusbc54tvhw5jgpyw",
    "username": "b6pzeusbc54tvhw5jgpyw",
    "team_id": "TD27NGKRD"
  },
  "channel": {
    "id": "C01181FJSD9",
    "name": "deleteme"
  },
  "callback_id": "ACTION_ON_MORE_OPEN_VIEW_REPLY",
  "trigger_id": "1042562042995.444260563863.770f3d58f1aee5856bbfcdcb3c877951",
  "message_ts": "1586185704.000900",
  "message": {
    "client_msg_id": "b3012309-a23e-4fe1-9b89-c859d4dd01b7",
    "type": "message",
    "text": "ee",
    "user": "UD2GNPF1U",
    "ts": "1586185704.000900",
    "team": "TD27NGKRD",
    "blocks": [
      {
        "type": "rich_text",
        "block_id": "lGwlL",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "ee"
              }
            ]
          }
        ]
      }
    ]
  },
  "response_url": "https://hooks.slack.com/app/TD27NGKRD/1042562043619/V4vtV0OMTVIfKCKWxmo8M33P"
}

describe("handler", () => {

  const rewired = require('./router-slack-action')

  let res: any
  let handleViewSubmissionAction: any
  let handleBlockAction: any
  let handleMoreAction: any
  beforeEach(() => {
    __rewire_reset_all__()

    res = {}
    res.status = sinon.stub().returns(res)
    res.json = sinon.stub().returns(res)
    res.end = sinon.stub().returns(res)
    res.send = sinon.stub().returns(res)

    handleViewSubmissionAction = sinon.fake.resolves(void 0)
    handleBlockAction = sinon.fake.resolves(void 0)
    handleMoreAction = sinon.fake.resolves(void 0)

    rewired.__set__('handleViewSubmissionAction', handleViewSubmissionAction)
    rewired.__set__('handleBlockAction', handleBlockAction)
    rewired.__set__('handleMoreAction', handleMoreAction)
  })

  test("handler - viewSubmissionPayload", async () => {
    const handler = rewired.__get__('handler')

    expect(isMyViewSubmissionPayload(viewSubmissionPayload)).toBe(true)
    const req = { body: { payload: JSON.stringify(viewSubmissionPayload) }}
    await handler(req, res)
    expect(handleViewSubmissionAction.callCount).toBe(1)
    expect(handleBlockAction.callCount).toBe(0)
    expect(handleMoreAction.callCount).toBe(0)
  })

  test("handler - blockActionPayload", async () => {
    const handler = rewired.__get__('handler')

    expect(isMyBlockActionPayload(blockActionPayload)).toBe(true)
    const req = { body: { payload: JSON.stringify(blockActionPayload) }}
    await handler(req, res)
    expect(handleViewSubmissionAction.callCount).toBe(0)
    expect(handleBlockAction.callCount).toBe(1)
    expect(handleMoreAction.callCount).toBe(0)
  })

  test("handler - moreActionPayload", async () => {
    const handler = rewired.__get__('handler')

    expect(isMoreActionPayload(moreActionPayload)).toBe(true)
    const req = { body: { payload: JSON.stringify(moreActionPayload) }}
    await handler(req, res)
    expect(handleViewSubmissionAction.callCount).toBe(0)
    expect(handleBlockAction.callCount).toBe(0)
    expect(handleMoreAction.callCount).toBe(1)
  })
})
