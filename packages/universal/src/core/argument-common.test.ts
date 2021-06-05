import sinon from 'sinon'
import { getContent } from './argument-common'
import { newVoice } from '../models/model-voice'
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
  let fakeGetHiddenMsgInfo: sinon.SinonSpy<any[], any>
  beforeEach(() => {
    __rewire_reset_all__()
    fakeGetHiddenMsgInfo = sinon.fake()
    rewired.__set__('getHiddenMsgInfo', fakeGetHiddenMsgInfo)
  })

  test("normal", () => {
    const c = getContent({ ...voiceBase })
    expect(c).toMatch(new RegExp(voiceBase.content))
    expect(c).toMatch(new RegExp(voiceBase.platformId))
    expect(fakeGetHiddenMsgInfo.callCount).toBe(0)
  })

  test("isDeleted: true", () => {
    const c = getContent({ ...voiceBase, isDeleted: true })
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(c).not.toMatch(new RegExp(voiceBase.platformId))
    expect(fakeGetHiddenMsgInfo.callCount).toBe(1)
  })

  test("isHiddenByReport: true", () => {
    const c = getContent({ ...voiceBase, isHiddenByReport: true })
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(c).not.toMatch(new RegExp(voiceBase.platformId))
    expect(fakeGetHiddenMsgInfo.callCount).toBe(1)
  })

  test("(신고자는 많지만) 정상", () => {
    const c = getContent({ ...voiceBase, isHiddenByReport: false, userReportArr: '123456789'.split('') })
    expect(c).toMatch(new RegExp(voiceBase.content))
    expect(c).toMatch(new RegExp(voiceBase.platformId))
    expect(fakeGetHiddenMsgInfo.callCount).toBe(0)
  })

  test("(신고자는 많지만) 정상인줄 알았지만 삭제", () => {
    const c = getContent({ ...voiceBase, isHiddenByReport: false, userReportArr: '123456789'.split(''), isDeleted: true })
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(c).not.toMatch(new RegExp(voiceBase.platformId))
    expect(fakeGetHiddenMsgInfo.callCount).toBe(1)
  })

  test("신고 & 삭제", () => {
    const c = getContent({ ...voiceBase, isHiddenByReport: true, isDeleted: true })
    expect(c).not.toMatch(new RegExp(voiceBase.content))
    expect(c).not.toMatch(new RegExp(voiceBase.platformId))
    expect(fakeGetHiddenMsgInfo.callCount).toBe(1)
  })
})

describe("getHiddenMsgInfo", () => {
  const rewired = require('./argument-common')
  const getHiddenMsgInfo = rewired.__get__('getHiddenMsgInfo')

  test("REPORTED", () => {
    const c = getHiddenMsgInfo('REPORTED', 3,4)
    expect(c).toMatch(/^:rotating_light:/)
    expect(c).toMatch(STR_REPORTED_MESSAGE)
    expect(c).toMatch(/:thumbsup: 3 \| :thumbsdown: 4 \|$/)
  })

  test("DELETED", () => {
    const c = getHiddenMsgInfo('DELETED', 3,4)
    expect(c).toMatch(/^:x:/)
    expect(c).toMatch(STR_DELETED_MESSAGE)
    expect(c).toMatch(/:thumbsup: 3 \| :thumbsdown: 4 \|$/)
  })

  test("test with number 0", () => {
    const c = getHiddenMsgInfo('REPORTED', 0,4)
    expect(c).toMatch(/^:rotating_light:/)
    expect(c).toMatch(STR_REPORTED_MESSAGE)
    expect(c).toMatch(/:thumbsup: 0 \| :thumbsdown: 4 \|$/)
  })

  test("test with number NaN", () => {
    const c = getHiddenMsgInfo('REPORTED', Number('wrong number'),4)
    expect(c).toMatch(/^:rotating_light:/)
    expect(c).toMatch(STR_REPORTED_MESSAGE)
    expect(c).toMatch(/:thumbsup: NaN \| :thumbsdown: 4 \|$/)
  })

  test("test with number Infinity", () => {
    const c = getHiddenMsgInfo('REPORTED', 1/0,4)
    expect(c).toMatch(/^:rotating_light:/)
    expect(c).toMatch(STR_REPORTED_MESSAGE)
    expect(c).toMatch(/:thumbsup: Infinity \| :thumbsdown: 4 \|$/)
  })
})
