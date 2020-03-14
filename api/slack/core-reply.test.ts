import sinon from 'sinon'
import to from 'await-to-js'

describe("core-reply", () => {
  const rewired = require('./core-reply')
  let getPermalink: sinon.SinonSpy<any[], any>
  let putReply: sinon.SinonSpy<any[], any>
  let web: any
  const postAndPutReply = rewired.__get__('postAndPutReply')


  beforeEach(() => {
    __rewire_reset_all__()
    putReply = sinon.fake()
    web = {
      chat: {
        postMessage: sinon.fake.resolves({
          ts: '1358546515.000008'
        }),
      },
    }
    rewired.__set__('putReply', putReply)
  })

  // https://api.slack.com/methods/chat.getPermalink
  const baseParam = {
    nickname: 'nickname',
    content: 'content',
    rawPassword: 'rawPassword',
    faceImoji: ':grinning:',
    threadTs: 'xxx',

    groupId: 'gridId-teamId-channelId',
    platformId: 'xxx',
  }

  test("postAndPutReply with normal threadTs", async () => {
    getPermalink = sinon.fake.resolves('https://ghostbusters.slack.com/archives/C1H9RESGA/p135854651500008')
    rewired.__set__('getPermalink', getPermalink)

    await postAndPutReply(web, baseParam)
    expect(getPermalink.callCount).toBe(1)
    expect(web.chat.postMessage.callCount).toBe(1)
    expect(putReply.callCount).toBe(1)
  })

  test("postAndPutReply with not first threadTs", async () => {
    getPermalink = sinon.fake.resolves("https://ghostbusters.slack.com/archives/C1H9RESGL/p135854651700023?thread_ts=1358546515.000008&cid=C1H9RESGL")
    rewired.__set__('getPermalink', getPermalink)

    const [err] = await to(postAndPutReply(web, baseParam))
    expect(err.message).toBe('Reply only can be added to first thread')
    expect(getPermalink.callCount).toBe(1)
    expect(web.chat.postMessage.callCount).toBe(0)
    expect(putReply.callCount).toBe(0)
  })

  test("postAndPutReply with wrong threadTs", async () => {
    getPermalink = sinon.fake.resolves(null)
    rewired.__set__('getPermalink', getPermalink)

    const [err] = await to(postAndPutReply(web, baseParam))
    expect(err.message).toBe('Wrong messageID. Or Message might be deleted')
    expect(getPermalink.callCount).toBe(1)
    expect(web.chat.postMessage.callCount).toBe(0)
    expect(putReply.callCount).toBe(0)
  })

})
