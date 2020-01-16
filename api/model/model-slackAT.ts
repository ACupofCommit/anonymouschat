import { every } from 'lodash';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../logger';
import { isArray } from 'util';
import { getDDC } from '../util';
import { TABLENAME_AT } from '../constant';

const TableName = TABLENAME_AT
const ddc = getDDC()

const logger = createLogger('at')
export interface ISlackAT {
  teamId: string
  ownerId: string
  accessToken: string
  scope: string
}
type TSlackATArr = ISlackAT[]

export const isSlackATArr = (items: any): items is TSlackATArr => {
  if (!isArray(items)) return false
  return every(items, isSlackAT)
}

export const isSlackAT = (item: any): item is ISlackAT => {
  if (!item || typeof item !== 'object') return false

  const { accessToken, ownerId, scope } = item
  if (!accessToken || typeof accessToken !== 'string') return false
  if (!ownerId || typeof ownerId !== 'string') return false
  if (!scope || typeof scope !== 'string') return false

  return true
}

export const getSlackAT = async (teamId: string, ownerId: string) => {
  const params: DocumentClient.GetItemInput = { TableName, Key: { teamId, ownerId }}
  const { Item: at } = await ddc.get(params).promise()
  if (!isSlackAT(at)) throw new Error(`can not get slackAT by: ${teamId}, ${ownerId}`)

  return at
}

export const getSlackATArrByOwnerId = async (ownerId: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    ExpressionAttributeValues: { ":ownerId": ownerId },
    KeyConditionExpression: "ownerId = :ownerId",
  }
  const { Items } = await ddc.query(params).promise()
  if (!isArray(Items)) throw new Error('Wrong result in getATArrByGroupId')
  return Items
}

export const getSlackATArrByTeamId = async (teamId: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    ExpressionAttributeValues: { ":teamId": teamId },
    KeyConditionExpression: "teamId = :teamId",
  }
  const { Items } = await ddc.query(params).promise()
  if (!isSlackATArr(Items)) throw new Error('Wrong result in getATArrByAccessToken')

  return Items
}

export const getSlackATByAccessToken = async (accessToken: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    ExpressionAttributeValues: { ":accessToken": accessToken },
    IndexName: 'IndexAccessToken',
    KeyConditionExpression: "accessToken = :accessToken",
    Limit: 1,
  }
  const { Items } = await ddc.query(params).promise()
  if (!isSlackATArr(Items)) throw new Error('Wrong result in getATArrByAccessToken')

  return Items[0]
}

export const updateSlackAT = async (at: ISlackAT) => {
  const params: DocumentClient.PutItemInput = { TableName, Item: at }
  await ddc.put(params).promise()
  return at
}

export const createSlackAT = async (teamId: string, ownerId: string, accessToken: string, scope: string) => {
  logger.debug(`in createSlackAT. teamId: ${teamId}, ownerId: ${ownerId}`)
  const slackAT: ISlackAT = { accessToken, ownerId, scope, teamId }
  const params: DocumentClient.PutItemInput = { TableName, Item: slackAT }
  await ddc.put(params).promise()
  return slackAT
}

export const deleteSlackAT = async (accessToken: string) => {
  const slackAT = await getSlackATByAccessToken(accessToken)
  await ddc.delete({ TableName, Key: slackAT }).promise()
}
