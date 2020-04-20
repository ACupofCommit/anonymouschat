import { isFirstThreadMsgByPermalink } from './core-common'

describe("core-common", () => {
  beforeEach(() => {
    __rewire_reset_all__()
  })

  test("isFirstThreadMsgByPermalink", () => {

    const firstThread = isFirstThreadMsgByPermalink('https://ghostbusters.slack.com/archives/C1H9RESGA/p135854651500008')
    expect(firstThread).toBe(true)

    const notFirstThread = isFirstThreadMsgByPermalink('https://ghostbusters.slack.com/archives/C1H9RESGL/p135854651700023?thread_ts=1358546515.000008&cid=C1H9RESGL')
    expect(notFirstThread).toBe(false)

    expect(() => isFirstThreadMsgByPermalink('wrong')).toThrowError()
    expect(() => isFirstThreadMsgByPermalink('')).toThrowError()
    expect(() => isFirstThreadMsgByPermalink(null)).toThrowError()
  })
})

