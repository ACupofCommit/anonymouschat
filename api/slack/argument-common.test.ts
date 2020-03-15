import sinon from 'sinon'
import { getContent, getMessageIdMsg, getVoteCountMsg } from './argument-common'
import { newVoice } from '../model/model-voice'
import { STR_DELETED_MESSAGE, STR_REPORTED_MESSAGE } from '../strings'

const voiceBase = newVoice({
  content: 'BPtwtXKaaZzBMscKjRTg',
  faceImoji: ':grinning:',
  groupId: 'gridId-workspaceId-channelId',
  nickname: 'test',
  platformId: '1581949200.008300',
  rawPassword: '1234',
})

describe("getContent", () => {

  const rewired = require('./argument-common')
  let fakeGetHiddenContent: sinon.SinonSpy<any[], any>
  beforeEach(() => {
    __rewire_reset_all__()
    fakeGetHiddenContent = sinon.fake()
    rewired.__set__('getHiddenContent', fakeGetHiddenContent)
  })

  test("normal", () => {
    const voice = { ...voiceBase }

    const c = getContent(voice)
    expect(c).toMatch(new RegExp(voiceBase.content))
    expect(fakeGetHiddenContent.callCount).toBe(0)

    const m = getMessageIdMsg(voice)
    expect(m).toMatch(new RegExp(voiceBase.platformId))
  })

  test("isDeleted: true", () => {
    const voice = { ...voiceBase , isDeleted: true }

    const c = getContent(voice)
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(fakeGetHiddenContent.callCount).toBe(1)

    const m = getMessageIdMsg(voice)
    expect(m).toBeNull()
  })

  test("isHiddenByReport: true", () => {
    const voice = { ...voiceBase , isHiddenByReport: true }

    const c = getContent(voice)
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(fakeGetHiddenContent.callCount).toBe(1)

    const m = getMessageIdMsg(voice)
    expect(m).toBeNull()
  })

  test("(신고자는 많지만) 정상", () => {
    const voice = { ...voiceBase, isHiddenByReport: false, userReportArr: '123456789'.split('') }

    const c = getContent(voice)
    expect(c).toMatch(new RegExp(voiceBase.content))
    expect(fakeGetHiddenContent.callCount).toBe(0)

    const m = getMessageIdMsg(voice)
    expect(m).toMatch(new RegExp(voiceBase.platformId))
  })

  test("(신고자는 많지만) 정상인줄 알았지만 삭제", () => {
    const voice = { ...voiceBase, isHiddenByReport: false, userReportArr: '123456789'.split(''), isDeleted: true }

    const c = getContent(voice)
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(fakeGetHiddenContent.callCount).toBe(1)

    const m = getMessageIdMsg(voice)
    expect(m).toBeNull()
  })

  test("신고 & 삭제", () => {
    const voice = { ...voiceBase, isHiddenByReport: true, isDeleted: true }

    const c = getContent(voice)
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(fakeGetHiddenContent.callCount).toBe(1)

    const m = getMessageIdMsg(voice)
    expect(m).toBeNull()
  })
})

describe("getHiddenContent", () => {
  const rewired = require('./argument-common')
  const getHiddenContent = rewired.__get__('getHiddenContent')

  test("REPORTED", () => {
    const c = getHiddenContent('REPORTED')
    expect(c).toMatch(/^:rotating_light:/)
    expect(c).toMatch(STR_REPORTED_MESSAGE)
  })

  test("DELETED", () => {
    const c = getHiddenContent('DELETED')
    expect(c).toMatch(/^:x:/)
    expect(c).toMatch(STR_DELETED_MESSAGE)
  })
})

describe("getVoteCountMsg", () => {
  // const rewired = require('./argument-common')
  // const getVoteCountMsg = rewired.__get__('getVoteCountMsg')

  test("LIKE", () => {
    const voice = { ...voiceBase, userLikeArr: '12'.split('') }
    const c = getVoteCountMsg(voice)
    expect(c).toMatch(/:thumbsup: 2/)
  })

  test("DISLIKE", () => {
    const voice = { ...voiceBase, userDislikeArr: '12345'.split('') }
    const c = getVoteCountMsg(voice)
    expect(c).toMatch(/:thumbsdown: 5/)
  })

  test("REPORTED", () => {
    const voice = { ...voiceBase, userReportArr: '123'.split('') }
    const c = getVoteCountMsg(voice)
    expect(c).toMatch(/:rotating_light: 3/)
  })
})
