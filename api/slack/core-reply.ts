import axios from 'axios'
import { WebClient } from "@slack/web-api"
import { IParamNewReply, IReply, IPMNewReplyView, isPMCreateReplyView } from "../../types/type-reply"
import { newReply, putReply, getReply } from "../model/model-reply"
import { getReplyArg, getNewReplyViewsOpen } from "./argument-reply"
import { getVoiceId, getReplyId, IMyBlockActionPayload, getGroupId, IMyViewSubmissionPayload } from "../model/model-common"
import { toggle, isNotEmptyString } from "../../common/common-util"
import { IGroup } from "../../types/type-group"
import { INPUT_NAME_NICKNAME, INPUT_NAME_CONTENT, INPUT_NAME_PASSWORD, INPUT_FACE_IMOJI, NOT_YET } from "../constant"

export const createReplyFromSlack = async (web: WebClient, payload: IMyViewSubmissionPayload, group: IGroup) => {
  const { view } = payload
  const pm: IPMNewReplyView = JSON.parse(payload.view.private_metadata)
  if (!isPMCreateReplyView(pm)) throw new Error('pm is not IPMNewReplyView')

  const { channelId, threadTs } = pm
  const nickname = ''+view.state.values[INPUT_NAME_NICKNAME].s.value
  const content = ''+view.state.values[INPUT_NAME_CONTENT].s.value
  const rawPassword = ''+view.state.values[INPUT_NAME_PASSWORD].s.value
  const faceImoji = ''+view.state.values[INPUT_FACE_IMOJI].so.selected_option.value
  if (!nickname || !content || !rawPassword || !faceImoji) throw new Error('Invalid state')

  const groupId = getGroupId(channelId, group.teamId, group.gridId)
  const param: IParamNewReply = { platformId: NOT_YET, threadTs, nickname, content, rawPassword, faceImoji, groupId }
  await postAndPutReply(web, param)
}

export const postAndPutReply = async (web: WebClient, param: IParamNewReply) => {
  const { threadTs, groupId } = param
  const reply = newReply(param)
  const replyArg = getReplyArg(reply, threadTs)
  const result = await web.chat.postMessage(replyArg)
  if (!isNotEmptyString(result?.ts)) throw new Error('Wrong result.ts')

  const voiceId = getVoiceId(groupId, threadTs)
  const replyId = getReplyId(voiceId, result.ts)
  await putReply({ ...reply, replyId, platformId: result.ts })
}

export const voteSlackReply = async (payload: IMyBlockActionPayload, type: 'LIKE' | 'DISLIKE') => {
  const { team, channel, container, user, response_url } = payload
  if (!container.thread_ts) throw new Error('not found message.thread_ts')

  const groupId = getGroupId(channel.id, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, container.thread_ts)
  const replyId = getReplyId(voiceId, container.message_ts)
  const r = await getReply(replyId)

  const userLikeArr = type === 'LIKE' ? toggle(r.userLikeArr, user.id) : r.userLikeArr
  const userDislikeArr = type === 'DISLIKE' ? toggle(r.userDislikeArr, user.id) : r.userDislikeArr
  const newReply: IReply = { ...r, userLikeArr, userDislikeArr }

  const updatedReply = await putReply(newReply)
  await axios.post(response_url, getReplyArg(updatedReply))
}

export const openViewToPostReply = async (web: WebClient, payload: IMyBlockActionPayload) => {
  const { trigger_id, channel, container } = payload
  const pm: IPMNewReplyView = { channelId: channel.id, threadTs: container.message_ts, channelName: channel.name }
  const arg = getNewReplyViewsOpen(trigger_id, pm)
  await web.views.open(arg)
}
