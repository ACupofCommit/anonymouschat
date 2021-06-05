import { every, isArray } from 'lodash';
import { Installation } from '@slack/oauth'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger.util';
import { getDDC } from '../utils/common.util';
import { TABLENAME_AT } from '../models/constants.model';

const TableName = TABLENAME_AT
const ddc = getDDC()

const logger = createLogger('at')
export interface ISlackAT {
  teamId: string
  ownerId: string
  accessToken: string
  installation: Installation<'v2'>
}
type TSlackATArr = ISlackAT[]

export const isSlackATArr = (items: any): items is TSlackATArr => {
  if (!isArray(items)) return false
  return every(items, isSlackAT)
}

export const isSlackAT = (item: any): item is ISlackAT => {
  if (!item || typeof item !== 'object') return false

  const { ownerId } = item
  // if (!accessToken || typeof accessToken !== 'string') return false
  if (!ownerId || typeof ownerId !== 'string') return false
  // if (!scope || typeof scope !== 'string') return false

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

// export const createSlackAT = async (teamId: string, ownerId: string, accessToken: string, scope: string) => {
//   logger.debug(`in createSlackAT. teamId: ${teamId}, ownerId: ${ownerId}`)
//   const slackAT: ISlackAT = { accessToken, ownerId, scope, teamId }
//   const params: DocumentClient.PutItemInput = { TableName, Item: slackAT }
//   await ddc.put(params).promise()
//   return slackAT
// }

export const deleteSlackAT = async (accessToken: string) => {
  const slackAT = await getSlackATByAccessToken(accessToken)
  await ddc.delete({ TableName, Key: slackAT }).promise()
}

export const setAT = async (teamId: string, ownerId: string, accessToken: string='dummy', installation: Installation<'v2'>) => {
  logger.debug(`set. teamId: ${teamId}, ownerId: ${ownerId}`)
  const slackAT: ISlackAT = { accessToken, ownerId, teamId, installation }
  const params: DocumentClient.PutItemInput = { TableName, Item: slackAT }
  await ddc.put(params).promise()
  return slackAT
}

export const getAT = async (teamId: string, ownerId: string) => {
  logger.debug(`getAT. teamId: ${teamId}, ownerId: ${ownerId}`)
  logger.debug(`temp, ownerId modifeid: WFDJ0L1N0`)
  const modifiedOwnerId = 'WFDJ0L1N0'
  const params: DocumentClient.GetItemInput = { TableName, Key: { teamId, ownerId: modifiedOwnerId }}
  const { Item: at } = await ddc.get(params).promise()
  if (!isSlackAT(at)) throw new Error(`can not get slackAT by: ${teamId}, ${ownerId}`)

  return at.installation
}
