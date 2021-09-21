import { isNotEmptyString, isNotNullObject } from "../utils/typecheck.util"

export interface ISlashCommandPayload {
  token?: string;
  team_id: string
  team_domain?: string;
  channel_id: string
  channel_name?: string;
  user_id: string
  user_name?: string;
  response_url: string
  trigger_id: string
  text: string
  command?: string;
  enterprise_id?: string;
  enterprise_name?: string;
}

export type LCA2 = 'en' | 'ko'

export interface IPMDeletionView {
  channelId: string
  channelName: string
  ts: string
  threadTs?: string

  // web.chat.update 사용하면 imoji_name, name이 사라지는 문제 발생.
  // 문제 해결될 때 까지 response_url 을 사용해야함
  responseUrl: string
}

export interface IChatGetPermalinkResponse {
    ok?:        boolean;
    permalink?: string;
    channel?:   string;
    error?:     string;
    needed?:    string;
    provided?:  string;
}

export interface IFaceImoji {
  value: string
  label: string
}

export interface IPMDeactivateWarningView {
  channelId: string
  channelName?: string
}

export const isPMDeletionView = (o: any): o is IPMDeletionView => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.channelId)) return false
  if (!isNotEmptyString(o.channelName)) return false
  if (!isNotEmptyString(o.ts)) return false
  return true
}

export const isMySlashCommandRequest = (o: any): o is ISlashCommandPayload => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.team_id)) return false
  if (!isNotEmptyString(o.channel_id)) return false
  if (!isNotEmptyString(o.user_id)) return false
  if (!isNotEmptyString(o.response_url)) return false
  if (!isNotEmptyString(o.trigger_id)) return false

  // user가 typing하는 부분. 빈 문자가 올 수도 있음
  if (typeof o.text !== 'string') return false

  return true
}

export const isPMDeactivateWarningView = (o: any): o is IPMDeactivateWarningView => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.channelId)) return false
  if (!isNotEmptyString(o.channelName)) return false
  return true
}

export const parseVoiceId = (voiceId: string) => {
  const [gridId, teamId, channelId] = voiceId.split('-')
  if (!gridId || !teamId || !channelId) throw new Error('Wrong voiceId format')
  return { gridId, teamId, channelId }
}

export const parseReplyId = (replyId: string) => {
  const [gridId, teamId, channelId, voiceTS] = replyId.split('-')
  if (!gridId || !teamId || !channelId || !voiceTS) throw new Error('Wrong replyId format')
  return { gridId, teamId, channelId, voiceTS }
}

export const parseGroupId = (groupId: string) => {
  const [gridId, teamId, channelId] = groupId.split('-')
  if (!gridId || !teamId || !channelId) throw new Error('Wrong groupId format')
  return { gridId, teamId, channelId }
}
