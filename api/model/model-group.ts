import to from 'await-to-js'
import { DocumentClient, CreateTableInput } from 'aws-sdk/clients/dynamodb'
import gp from 'generate-password'

import { createLogger } from '../logger'
import { getDDC } from '../util'
import { NOT_GRID, NOT_YET, ERROR_CAN_NOT_QUERY_GROUP_BY_WEB_ACCESS_TOKEN, ERROR_CAN_NOT_GET_GROUP_BY_WEB_ACCESS_TOKEN, TABLENAME_GROUP } from '../constant'
import { isGroup, isGroupKeysArr, IGroup, IGroupKeys } from '../../types/type-group'
import { isNotEmptyString } from '../../common/common-util'

const TableName = TABLENAME_GROUP
const ddc = getDDC()
const logger = createLogger('group')

export const scheme: CreateTableInput = {
  BillingMode: 'PAY_PER_REQUEST',
  TableName,
  AttributeDefinitions: [
    { AttributeName: 'teamId', AttributeType: 'S' },
    { AttributeName: 'channelId', AttributeType: 'S' },
    { AttributeName: 'accessToken', AttributeType: 'S' },
    { AttributeName: 'webAccessToken', AttributeType: 'S' },
    { AttributeName: 'webAccessTokenExpirationTime', AttributeType: 'N' },
  ],
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' },
  ],
  GlobalSecondaryIndexes: [{
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexTeamId',
    KeySchema: [
      { AttributeName: 'teamId', KeyType: 'HASH' },
    ],
  }, {
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexAccessToken',
    KeySchema: [
      { AttributeName: 'accessToken', KeyType: 'HASH' },
    ],
  }, {
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexWebAccessToken',
    KeySchema: [
      { AttributeName: 'webAccessToken', KeyType: 'HASH' },
    ],
  }, {
    Projection: {
      ProjectionType: 'INCLUDE',
      NonKeyAttributes: ['teamId','webAccessTokenExpirationTime','activationMsgTs'],
    },
    IndexName: 'IndexWebAccessTokenExpirationTime',
    KeySchema: [
      { AttributeName: 'teamId', KeyType: 'HASH' },
      { AttributeName: 'webAccessTokenExpirationTime', KeyType: 'RANGE' },
    ],
  }],
  StreamSpecification: {
    StreamEnabled: false
  },
}

/**
 * 그룹을 찾아 리턴하고, 없으면 새로운 그룹 생성 후 리턴
 */
export const getOrCreateGetGroup = async (channelId: string, teamId: string, channelName: string=NOT_YET, gridId: string=NOT_GRID) => {
  const [, group] = await to(getGroup(channelId))
  if (isGroup(group) && group.channelName === channelName && group.gridId && gridId) {
    return group
  }

  const updatedOrNewGroup = isGroup(group)
    ? { ...group, channelName, gridId }
    : newGroup(channelId, teamId, channelName, gridId)

  const updatedGroup = await putGroup(updatedOrNewGroup)
  return updatedGroup
}

export const getGroup = async (channelId: string) => {
  const params: DocumentClient.GetItemInput = { TableName, Key: { channelId }}
  const { Item: group } = await ddc.get(params).promise()
  if (!isGroup(group)) throw new Error(`can not get group by: ${channelId}`)

  return group
}

export const getGroupKeysArrByTeamId = async (teamId: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    IndexName: 'IndexTeamId',
    ExpressionAttributeValues: { ":teamId": teamId },
    KeyConditionExpression: "teamId = :teamId",
    Limit: 200,
  }
  const result = await ddc.query(params).promise()
  if (!result || !isGroupKeysArr(result.Items)) throw new Error('Can not get groupKeysArr by teamId' + teamId)

  return result.Items
}

export const newGroup = (channelId: string, teamId: string, channelName: string, gridId: string) => {
  const group: IGroup = {
    channelId, channelName, teamId, gridId,
    agreedUserArr: [], isPostingAvailable: false,
    forceActivateUserId: NOT_YET, forceDeactivateUserId: NOT_YET,
    accessToken: NOT_YET, activationMsgTs: NOT_YET,
    webAccessToken: createWebAccessToken(),
    // isPostingAvailable: false일때는 갱신을 위한 query날릴때 앞에 나오지 않도록 -1로 셋팅해둠.
    webAccessTokenExpirationTime: -1,
    numberOfReportToHidden: 5
  }
  return group
}

export const putGroup = async (group: IGroup) => {
  const params: DocumentClient.PutItemInput = { TableName, Item: group }
  await ddc.put(params).promise()
  logger.debug(`put group into table ${TableName}. teamId: ${group.teamId}, channelId: ${group.channelId}`)
  return group
}

export const createWebAccessToken = () => {
  return gp.generate({ length: 12, numbers: true })
}

export const getGroupByWebAccessToken = async (webAccessToken: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    ExpressionAttributeValues: { ":webAccessToken": webAccessToken },
    IndexName: 'IndexWebAccessToken',
    KeyConditionExpression: "webAccessToken = :webAccessToken",
    Limit: 1,
  }
  const result = await ddc.query(params).promise()
  const channelId = ((result.Items || {})[0] || {}).channelId
  if (!isNotEmptyString(channelId)) throw new Error(ERROR_CAN_NOT_QUERY_GROUP_BY_WEB_ACCESS_TOKEN)

  const group = await getGroup(channelId)
  if (!isGroup(group)) throw new Error(ERROR_CAN_NOT_GET_GROUP_BY_WEB_ACCESS_TOKEN)

  return group
}

export const getGroupKeysArrByAccessToken = async (accessToken: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    ExpressionAttributeValues: { ":accessToken": accessToken },
    IndexName: 'IndexAccessToken',
    KeyConditionExpression: "accessToken = :accessToken",
  }
  const result = await ddc.query(params).promise()
  if (!result || !isGroupKeysArr(result.Items)) throw new Error('Can not get group by accessToken - 1: ' + accessToken)

  return result.Items
}

export const getExpiredGroupKeysArrByTeamId = async (teamId: string, ts: number, Limit: number) => {
  const params: DocumentClient.QueryInput = {
    TableName: TableName,
    ExpressionAttributeValues: { ":ts": ts, ":teamId": teamId, ":zero": 0 },
    IndexName: 'IndexWebAccessTokenExpirationTime',
    KeyConditionExpression: "teamId = :teamId AND webAccessTokenExpirationTime BETWEEN :zero AND :ts",
    Limit,
  }

  const result = await ddc.query(params).promise()
  if (!result || !isGroupKeysArr(result.Items)) throw new Error('Can not get group getExpiredGroupKeysArrByTeamId')

  return result.Items
}

interface IRequetArrGroupBatchUpdate extends IGroupKeys {
  [key: string]: any
}
export const updateBatchGroup = async (requestArr: IRequetArrGroupBatchUpdate[]) => {
  const putRequestArr = requestArr.map( Item => ({ PutRequest: { Item }}))
  await ddc.batchWrite({ RequestItems: {[TableName]: putRequestArr }}).promise()
}

export const isWebTokenValid = (token: string, tokenExpirationTime: number) => {
  if (token === NOT_YET) return false
  if (tokenExpirationTime < new Date().getTime()) return false

  return true
}
