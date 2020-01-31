import { newTeam, putTeam, getTeamArr, scheme } from './model-team'
import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { getDDC, getDD } from '../util'
const rewired = require('./model-team')

const ddc = getDDC('us-west-2', 'AKXXXXXXXXXXXXXXXXF5', 'LQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxVV', 'http://localhost:8000/')
const dd = getDD('us-west-2', 'AKXXXXXXXXXXXXXXXXF5', 'LQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxVV', 'http://localhost:8000/')
const TableName = scheme.TableName + '-jest'

beforeAll(async () => {
  const modifiedScheme: CreateTableInput = { ...scheme, TableName }
  await dd.createTable(modifiedScheme).promise()
  console.log('createdTable: ' + TableName)

  rewired.__set__('TableName', TableName)
  rewired.__set__('ddc', ddc)
})

test("putTeam, getTeamArr", async () => {
  await putTeam(newTeam('t1','name-t1','g1'))
  await putTeam(newTeam('t2','name-t2','g1'))
  await putTeam(newTeam('t3','name-t3','g2'))
  await putTeam(newTeam('t4','name-t4','g2'))
  const teamArr = await getTeamArr()
  expect(teamArr.length).toBe(4)
})

afterAll(async () => {
  __rewire_reset_all__()
  await dd.deleteTable({ TableName }).promise()
  console.log('deletedTable:' + TableName)
})
