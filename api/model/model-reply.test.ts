import { scheme, newReply, putReply, getReply } from './model-reply'
import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { getDDC, getDD } from '../util'
import { IParamNewReply  } from '../../types/type-reply'
const rewired = require('./model-reply')

const ddc = getDDC(void 0, 'xx', 'xxx', 'http://localhost:8000/')
const dd = getDD(void 0, 'xx', 'xxx', 'http://localhost:8000/')
const TableName = scheme.TableName + '-jest'

beforeAll(async () => {
  const modifiedScheme: CreateTableInput = { ...scheme, TableName }
  await dd.createTable(modifiedScheme).promise()
  console.log('createdTable: ' + TableName)

  rewired.__set__('TableName', TableName)
  rewired.__set__('ddc', ddc)
})

test("putReply, getReply", async () => {
  const param: IParamNewReply = {
    content: "c1",
    faceImoji: ":grinning:",
    groupId: "g1-t1-c1",
    threadTs: '100.1',
    nickname: "n1",
    platformId: "111.1",
    rawPassword: "1234",
  }
  const t1 = newReply({ ...param, content:"c1", platformId:"111.1" })
  const t2 = newReply({ ...param, content:"c2", platformId:"111.2" })
  const t3 = newReply({ ...param, content:"c3", platformId:"111.3" })
  const t4 = newReply({ ...param, content:"c4", platformId:"111.4" })

  await putReply(t1)
  await putReply(t2)
  await putReply(t3)
  await putReply(t4)

  const voice = await getReply(t1.replyId)
  expect(voice.content).toBe(t1.content)
})

afterAll(async () => {
  __rewire_reset_all__()
  await dd.deleteTable({ TableName }).promise()
  console.log('deletedTable: ' + TableName)
})


