import { isArray, every, isString, isBoolean } from "lodash"
import { isNotEmptyString, isNotNullObject } from "../utils/typecheck.util"

export interface IVoice {
  voiceId: string
  groupId: string
  nickname: string
  faceImoji: string
  content: string
  userLikeArr: string[]
  userDislikeArr: string[]
  userReportArr: string[]
  platformId: string   // slack message_ts
  password: string
  isDeleted: boolean
  isHiddenByReport: boolean
}

export const isVoice = (item: any): item is IVoice => {
  if (!isNotNullObject(item)) return false

  const {
    voiceId, nickname, content, userLikeArr, userDislikeArr, userReportArr,
    platformId, password, groupId, isDeleted, isHiddenByReport
  } = item
  if (!isNotEmptyString(voiceId)) return false
  if (!isNotEmptyString(groupId)) return false
  if (!isNotEmptyString(nickname)) return false
  if (!isNotEmptyString(content)) return false
  if (!isNotEmptyString(platformId)) return false
  if (!isNotEmptyString(password)) return false
  if (!isBoolean(isDeleted)) return false
  if (!isBoolean(isHiddenByReport)) return false
  if (!isArray(userLikeArr)    || !every(userLikeArr, isString)) return false
  if (!isArray(userDislikeArr) || !every(userDislikeArr, isString)) return false
  if (!isArray(userReportArr)  || !every(userReportArr, isString)) return false

  return true
}

export const isVoiceArr = (arr: any): arr is IVoice[] => {
  if (!isArray(arr)) return false
  return every(arr, isVoice)
}

export interface IParamNewVoiceFromWeb {
  nickname: string
  content: string
  rawPassword: string
  faceImoji: string
}
export interface IParamNewVoice extends IParamNewVoiceFromWeb {
  platformId: string
  groupId: string
}

export const isParamNewVoiceFromWeb = (p: any): p is IParamNewVoiceFromWeb => {
  if (!isNotNullObject(p)) return false

  const { nickname, content, rawPassword, faceImoji } = p as any
  if (!isNotEmptyString(nickname)) return false
  if (!isNotEmptyString(content)) return false
  if (!isNotEmptyString(rawPassword)) return false
  if (!isNotEmptyString(faceImoji)) return false

  return true
}

export const isParamNewVoice = (p: any): p is IParamNewVoice => {
  if (!isParamNewVoiceFromWeb(p)) return false

  const { platformId, groupId } = p as any
  if (!isNotEmptyString(platformId)) return false
  if (!isNotEmptyString(groupId)) return false

  return true
}

export interface IPMNewVoiceView {
  channelId: string
  channelName: string
}

export const isPMNewVoiceView = (o: any): o is IPMNewVoiceView => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.channelId)) return false

  return true
}
