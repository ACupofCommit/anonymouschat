import { isArray, every } from "lodash"
import { LCA2 } from "./type-common"

export interface IGroupKeys {
  teamId: string
  channelId: string
}

export interface IGroup {
  channelId: string
  channelName?: string
  teamId: string
  gridId: string
  agreedUserArr: string[]        // 해당 채널에 /av 사용을 동의한 유저Id 리스트.
  isPostingAvailable: boolean    // ACTIVATION_QUORUM <= agreedUserArr.length 일 때 true가 됨.
  activationMsgTs: string        // 앱 사용 동의 받기 위해 포스팅한 메세지의 공유 링크
  forceActivateUserId: string    // 정족수(QUORUM) 와 상관없이 강제로 앱 활성화 시킨 userId (최근 1명)
  forceDeactivateUserId: string  // 강제로 앱 비활성화 시킨 userId (최근 1명)
  accessToken: string
  webAccessToken: string
  webAccessTokenExpirationTime: number
  numberOfReportToHidden: number
  lca2: LCA2

  // TODO:
  // limitPerPeriod: number      // reset 시간 전까지 작성 글 수 제한
  // resetTimeArr: number[]      // ex: 3,6,9 하루 3시, 6시, 9시에 count reset. 다시 limitPerPeriod 까지 작성 가능
}

export const isGroup = (item: any): item is IGroup => {
  if (!item || typeof item !== 'object') return false

  const { channelId, channelName, teamId, gridId, agreedUserArr, isPostingAvailable, activationMsgTs, forceActivateUserId, forceDeactivateUserId, accessToken, webAccessToken, webAccessTokenExpirationTime } = item
  if (!channelId || typeof channelId !== 'string') return false
  if (!channelName || typeof channelName !== 'string') return false
  if (!teamId || typeof teamId !== 'string') return false
  if (!gridId || typeof gridId !== 'string') return false
  if (!isArray(agreedUserArr)) return false
  if (typeof isPostingAvailable !== 'boolean') return false
  if (!activationMsgTs || typeof activationMsgTs !== 'string') return false
  if (!forceActivateUserId || typeof forceActivateUserId !== 'string') return false
  if (!forceDeactivateUserId || typeof forceDeactivateUserId !== 'string') return false
  if (!accessToken || typeof accessToken !== 'string') return false
  if (!webAccessToken || typeof webAccessToken !== 'string') return false
  if (typeof webAccessTokenExpirationTime !== 'number') return false

  return true
}

export const isGroupArr = (arr: any): arr is IGroup[] => {
  if (!isArray(arr)) return false

  return every(arr, isGroup)
}

const isGroupKeys = (item: any): item is IGroupKeys => {
  if (typeof item !== 'object') return false

  const { teamId, channelId } = item
  if (typeof teamId !== 'string' || !teamId) return false
  if (typeof channelId !== 'string' || !channelId) return false

  return true
}

export const isGroupKeysArr = (arr: any): arr is IGroupKeys[] => {
  if (!isArray(arr)) return false
  if (!every(arr, isGroupKeys)) return false

  return true
}
