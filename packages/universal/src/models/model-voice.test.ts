import { newVoice, putVoice, getVoice, getVoiceArrByGroupId, scheme } from './model-voice'
import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { getDDC, getDD } from '../utils/common.util'
import { IParamNewVoice } from '../types/type-voice'
const rewired = require('./model-voice')

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

test("putVoice, getVoice", async () => {
  const param: IParamNewVoice = {
    content: "c1",
    faceImoji: ":grinning:",
    groupId: "g1-t1-c1",
    nickname: "n1",
    platformId: "111.1",
    rawPassword: "1234",
  }
  const t1 = newVoice({ ...param, content:"c1", platformId:"111.1" })
  const t2 = newVoice({ ...param, content:"c2", platformId:"111.2" })
  const t3 = newVoice({ ...param, content:"c3", platformId:"111.3" })
  const t4 = newVoice({ ...param, content:"c4", platformId:"111.4" })

  await putVoice(t1)
  await putVoice(t2)
  await putVoice(t3)
  await putVoice(t4)

  const voice = await getVoice(t1.voiceId)
  expect(voice.content).toBe(t1.content)

  const voiceArr = await getVoiceArrByGroupId("g1-t1-c1")
  expect(voiceArr.length).toBe(4)
})

afterAll(async () => {
  __rewire_reset_all__()
  await dd.deleteTable({ TableName }).promise()
  console.log('deletedTable: ' + TableName)
})

