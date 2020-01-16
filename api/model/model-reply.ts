import crypto from 'crypto'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../logger'
import { getVoiceIdFromReplyId, getContent, getReplyId, getVoiceId } from './model-common'
import { getDDC } from '../util'
import { IParamNewReply, IReply, isReply } from '../../types/type-reply'
import { TABLENAME_REPLY } from '../constant'

const TableName = TABLENAME_REPLY
const ddc = getDDC()
const logger = createLogger('reply')

export const newReply = (p: IParamNewReply): IReply => {
  const { platformId, threadTs, groupId, nickname, content, rawPassword, faceImoji } = p
  const voiceId = getVoiceId(groupId, threadTs)
  const replyId = getReplyId(voiceId, platformId)
  const password = crypto.createHmac('sha256', rawPassword).digest('hex')
  const reply: IReply = {
    replyId, voiceId, nickname, content, password,
    userLikeArr: [], userDislikeArr: [], userReportArr: [],
    isDeleted: false, isHiddenByReport: false, platformId, faceImoji,
  }
  return reply
}

export const deleteReply = async (replyId: string, rawPassword: string) => {
  const reply = await getReply(replyId)
  const password = crypto.createHmac('sha256', rawPassword).digest('hex')
  if (reply.password !== password) return false

  await putReply({ ...reply, isDeleted: true })
  return true
}

export const getReply = async (replyId: string) : Promise<IReply> => {
  const voiceId = getVoiceIdFromReplyId(replyId)
  const Key = { replyId, voiceId }
  const r = await ddc.get({ TableName, Key }).promise()
  if (!isReply(r.Item)) throw new Error('can not get reply by: ' + replyId)

  return { ...r.Item, content: getContent(r.Item) }
}

export const putReply = async (reply: IReply): Promise<IReply> => {
  const params: DocumentClient.PutItemInput = { TableName, Item: reply }
  await ddc.put(params).promise()
  logger.debug(`put reply into '${TableName}'. replyId: ${reply.replyId}`)

  return { ...reply, content: getContent(reply) }
}
