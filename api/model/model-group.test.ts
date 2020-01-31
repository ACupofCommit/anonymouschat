import { getExpiredGroupKeysArrByTeamId, scheme, newGroup } from './model-group'
import { getDDC, getDD } from '../util'
import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { IGroup, isGroupKeysArr } from '../../types/type-group'
const rewired = require('./model-group')

const ddc = getDDC('us-west-2', 'AKXXXXXXXXXXXXXXXXF5', 'LQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxVV', 'http://localhost:8000/')
const dd = getDD('us-west-2', 'AKXXXXXXXXXXXXXXXXF5', 'LQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxVV', 'http://localhost:8000/')
const TableName = scheme.TableName + '-jest'

beforeAll( async () => {
  const modifiedScheme: CreateTableInput = { ...scheme, TableName }
  await dd.createTable(modifiedScheme).promise()
  console.log('createdTable: ' + TableName)

  rewired.__set__('TableName', TableName)
  rewired.__set__('ddc', ddc)

  const base = newGroup('', 't1', 'name1', 'g1')
  const arr: IGroup[] = [
    { ...base, channelId: 'c1', webAccessTokenExpirationTime: -1 },
    { ...base, channelId: 'c2', webAccessTokenExpirationTime: -1 },
    { ...base, channelId: 'c3', webAccessTokenExpirationTime: 100 },
    { ...base, channelId: 'c4', webAccessTokenExpirationTime: 200 },
    { ...base, channelId: 'c5', webAccessTokenExpirationTime: 300 },
    { ...base, channelId: 'c6', webAccessTokenExpirationTime: 400 },
    { ...base, channelId: 'c7', webAccessTokenExpirationTime: 500 },
    { ...base, channelId: 'c8', webAccessTokenExpirationTime: 600 },
    { ...base, channelId: 'c9', webAccessTokenExpirationTime: 700 },
  ]
  const promiseArr = arr.map(Item => ddc.put({ TableName, Item }).promise())
  await Promise.all(promiseArr)
})

test("getExpiredGroupKeysArrByTeamId", async () => {
  const arr = await getExpiredGroupKeysArrByTeamId('t1', 310, 2)
  expect(isGroupKeysArr(arr)).toBe(true)
  expect(arr.length).toBe(2)
  expect(arr[0].channelId).toBe('c3')
  expect(arr[1].channelId).toBe('c4')
})

afterAll(async () => {
  __rewire_reset_all__()
  await dd.deleteTable({ TableName }).promise()
  console.log('deletedTable:' + TableName)
})
