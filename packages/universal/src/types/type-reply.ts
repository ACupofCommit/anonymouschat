import { every, isArray, isString, isBoolean } from "lodash"
import { isNotNullObject, isNotEmptyString } from "../utils/typecheck.util"

export interface IReply {
  replyId: string
  voiceId: string
  nickname: string
  faceImoji: string
  content: string
  userLikeArr: string[]
  userDislikeArr: string[]
  userReportArr: string[]
  platformId: string  // slack message_ts
  password: string
  isDeleted: boolean
  isHiddenByReport: boolean
}

export const isReply = (item: any): item is IReply => {
  if (!isNotNullObject(item)) return false

  const {
    replyId, nickname, content, platformId,
    userLikeArr, userDislikeArr, userReportArr, voiceId,
    isDeleted, isHiddenByReport
  } = item
  if (!isNotEmptyString(replyId)) return false
  if (!isNotEmptyString(voiceId)) return false
  if (!isNotEmptyString(nickname)) return false
  if (!isNotEmptyString(content)) return false
  if (!isNotEmptyString(platformId)) return false
  if (!isBoolean(isDeleted)) return false
  if (!isBoolean(isHiddenByReport)) return false
  if (!isArray(userLikeArr)    || !every(userLikeArr, isString)) return false
  if (!isArray(userDislikeArr) || !every(userDislikeArr, isString)) return false
  if (!isArray(userReportArr)  || !every(userReportArr, isString)) return false

  return true
}

export const isReplyArr = (arr: any): arr is IReply[] => {
  if (!isArray(arr)) return false
  return every(arr,isReply)
}

export interface IParamNewReplyFromWeb {
  nickname: string
  content: string
  rawPassword: string
  faceImoji: string
  threadTs: string
}
export interface IParamNewReply extends IParamNewReplyFromWeb {
  groupId: string
  platformId: string
}

export const isParamNewReplyFromWeb = (p: any): p is IParamNewReplyFromWeb => {
  if (!isNotNullObject(p)) return false

  const { nickname, content, rawPassword, faceImoji, threadTs } = p
  if (!isNotEmptyString(nickname)) return false
  if (!isNotEmptyString(content)) return false
  if (!isNotEmptyString(rawPassword)) return false
  if (!isNotEmptyString(faceImoji)) return false
  if (!isNotEmptyString(threadTs)) return false

  return true
}

export const isParamNewReply = (p: any): p is IParamNewReply => {
  if (!isParamNewReplyFromWeb(p)) return false

  const { platformId, channelId } = p as any
  if (!isNotEmptyString(platformId)) return false
  if (!isNotEmptyString(channelId)) return false

  return true
}

export interface IPMNewReplyView {
  channelId: string
  channelName: string
  threadTs: string
}

export const isPMCreateReplyView = (o: any): o is IPMNewReplyView => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.channelId)) return false
  if (!isNotEmptyString(o.channelName)) return false
  if (!isNotEmptyString(o.threadTs)) return false
  return true
}
