import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Installation } from '@slack/oauth'
import { createLogger } from '../utils/logger.util';
import { getDDC } from '../utils/common.util';
import { NOT_GRID, TABLENAME_OAUTH_TOKENS } from '../models/constants.model';
import { isOAuthToken, KeyType } from '../types/oauth-tokens.type'

const ddc = getDDC()
const TableName = TABLENAME_OAUTH_TOKENS
const logger = createLogger('oauth-tokens.model')

export const setToken = async (key: string, keyType: KeyType, installation: Installation<'v2'>) => {
  const uTime = new Date().toISOString()
  const Item = { key, keyType, installation, uTime }
  const params: DocumentClient.PutItemInput = { TableName, Item }
  await ddc.put(params).promise()
}

export const getToken = async (key: string) => {
  if (key === NOT_GRID) return void 0

  logger.debug(`getAT. key: ${key}`)
  const params: DocumentClient.GetItemInput = { TableName, Key: { key }}
  const { Item } = await ddc.get(params).promise()
  if (!Item) return void 0

  if (!isOAuthToken(Item)) throw new Error(`Can not get token by key: ${key}`)

  return Item.installation
}
