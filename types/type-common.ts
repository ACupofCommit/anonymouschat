import { isNotEmptyString, isNotNullObject } from "../common/common-util"

export interface IPMDeletionView {
  channelId: string
  channelName: string
  ts: string
  threadTs?: string
}

export const isPMDeletionView = (o: any): o is IPMDeletionView => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.channelId)) return false
  if (!isNotEmptyString(o.channelName)) return false
  if (!isNotEmptyString(o.ts)) return false
  return true
}

export interface IFaceImoji {
  value: string
  label: string
}
