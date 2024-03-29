import crypto from 'crypto'
import { isArray, every } from 'lodash'
import { DocumentClient} from 'aws-sdk/clients/dynamodb'

import { getGroupIdFromVoiceId, getVoiceId, getChannelIdFromGroupId } from './model-common'
import { createLogger } from '../utils/logger.util'
import { getDDC } from '../utils/common.util'
import { IParamNewVoice, IVoice, isVoice } from '../types/type-voice'
import { TABLENAME_VOICE } from '../models/constants.model'
import { getMessage } from '../core/nls'
import { getGroup } from './model-group'

const TableName = TABLENAME_VOICE
const ddc = getDDC()
const logger = createLogger('MODEL_VOICE')

export const newVoice = (p: IParamNewVoice): IVoice => {
  const { platformId, nickname, content, groupId, rawPassword, faceImoji } = p
  const voiceId = getVoiceId(groupId, platformId)
  const password = crypto.createHmac('sha256', rawPassword).digest('hex')
  const voice: IVoice = {
    voiceId, groupId, nickname, content,
    userLikeArr: [], userDislikeArr: [], userReportArr: [],
    platformId, password, faceImoji, isDeleted: false, isHiddenByReport: false,
  }
  return voice
}

export const getVoice = async (voiceId: string): Promise<IVoice> => {
  const Key = { voiceId, groupId: getGroupIdFromVoiceId(voiceId) }
  const r = await ddc.get({ TableName, Key }).promise()
  // TODO: voice가 없을 땐 null을 리턴하자
  if (!isVoice(r.Item)) throw new Error('can not get voice by voiceId: ' + voiceId)

  return r.Item
}

export const getVoiceArrByGroupId = async (groupId: string): Promise<IVoice[]> => {
  const params: DocumentClient.QueryInput = {
    TableName: TableName,
    ExpressionAttributeValues: { ":groupId": groupId },
    KeyConditionExpression: "groupId = :groupId",
    Limit: 200,
  }
  const { Items } = await ddc.query(params).promise()
  if (!isArray(Items)) throw new Error('can not get voiceArr by groupId: ' + groupId)

  const channelId = getChannelIdFromGroupId(groupId)
  const group = await getGroup(channelId, { cache: true })
  const m = getMessage(group.lca2)

  const voiceArr = Items.map( item => {
    const content = item.isDeleted ? m.STR_DELETED_MESSAGE : item.content
    const voice = { ...item, content }
    if (!isVoice(voice)) throw new Error('can not get voice in getVoiceArrByGroupId')

    return voice
  })

  return voiceArr
}

export const deleteVoice = async (voiceId: string, rawPassword: string) => {
  const voice = await getVoice(voiceId)
  const password = crypto.createHmac('sha256', rawPassword).digest('hex')
  if (voice.password !== password) return false

  await putVoice({ ...voice, isDeleted: true })
  return true
}

export const putVoice = async (voice: IVoice): Promise<IVoice> => {
  const params: DocumentClient.PutItemInput = { TableName, Item: voice }
  await ddc.put(params).promise()
  logger.debug(`put voice into ${TableName}. voiceId: ${voice.voiceId}`)

  return voice
}

export const getVoiceIdArrByTimeRange = async (start: string | number, end: string | number, groupId: string) => {
  const params: DocumentClient.QueryInput = {
    TableName: TableName,
    ExpressionAttributeValues: { ":start": start + '', ":end": end + '', ":groupId": groupId },
    IndexName: 'IndexGroupIdPlatformId',
    KeyConditionExpression: "groupId = :groupId AND platformId BETWEEN :start AND :end",
    Limit: 200,
  }
  const { Items } = await ddc.query(params).promise()
  if (!isArray(Items)) throw new Error('can not get voices by TimeRange')

  const hasVoiceId = (item: any) => item.voiceId && typeof item.voiceId === 'string'
  if (!every(Items, hasVoiceId)) throw new Error('Wrong voiceId in getVoiceIdArrByTimeRange')
  return Items.map(item => item.voiceId)
}
