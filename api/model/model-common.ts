
import { NOT_GRID } from "../constant"
import { STR_REPORTED_MESSAGE, STR_DELETED_MESSAGE } from "../strings"
import { IReply } from "../../types/type-reply"
import { IVoice } from "../../types/type-voice"
import { BlockActionPayload, Team, Channel, Container, User, View } from "../../types/BlockActionPayload"
import { ViewSubmissionPayload } from "../../types/ViewSubmissionPayload"

/**
 * voiceId 생성 규칙에 따라 voiceId를 생성하여 반환
 * @param groupId teamId:channelId of slack
 * @param platformId message ts of slack
 */
export const getVoiceId = (groupId: string, platformId: string) => {
  return `${groupId}-${platformId}`
}

export const getReplyId = (voiceId: string, ts: string) => {
  return `${voiceId}-${ts}`
}

export const getVoiceIdFromReplyId = (replyId: string) => {
  const [gridId, teamId, channelId, voiceTS] = replyId.split('-')
  const groupId = getGroupId(channelId, teamId, gridId)
  return getVoiceId(groupId, voiceTS)
}
export const getGroupId = (channelId: string, teamId: string, gridId: string=NOT_GRID) => {
  return `${gridId}-${teamId}-${channelId}`
}

export const getGroupIdFromVoiceId = (voiceId: string) => {
  const [gridId, teamId, channelId] = voiceId.split('-')
  return getGroupId(channelId, teamId, gridId)
}

export const getContent = (obj: IVoice | IReply) => {
  const { isHiddenByReport, isDeleted, content } = obj
  const modifiedContent =
      isHiddenByReport ? STR_REPORTED_MESSAGE
    : isDeleted        ? STR_DELETED_MESSAGE
    : content

  return modifiedContent
}

export interface IMyBlockActionPayload extends BlockActionPayload {
  team: Team & { id: string }
  channel: Channel & { id: string, name: string }
  container: Container & { message_ts: string, is_ephemeral: boolean, channel_id: string, type: string, thread_ts?: string }
  user: User & { id: string }
  response_url: string
  trigger_id: string
}

export const isMyBlockActionPayload = (o: any): o is IMyBlockActionPayload => {
  if (!o || typeof o !== 'object') return false

  const { team, channel, container, user, response_url, trigger_id } = o
  if (!team || !channel || !container || !user || !response_url || !trigger_id) return false
  if (!team.id || !channel.id || !channel.name || !user.id || !container.message_ts) return false

  return true
}

export interface IMyViewSubmissionPayload extends ViewSubmissionPayload {
  user: User & { id: string }
  team: Team & { id: string }
  view: View & {
    private_metadata: string
    state: {
      values: {[key: string]: any}
    }
  }
}

export const isMyViewSubmissionPayload = (o: any): o is IMyViewSubmissionPayload => {
  if (!o || typeof o !== 'object') return false

  const { team, user, view } = o
  if (!team || !user || !view) return false
  if (!team.id || !user.id || !view.private_metadata) return false

  return true
}
