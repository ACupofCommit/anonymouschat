import axios from 'axios'
import to from "await-to-js"
import { WebClient, View, ViewsUpdateArguments } from "@slack/web-api"
import { IMyViewSubmissionPayload, getGroupId, IMyBlockActionPayload, getVoiceId } from "../models/model-common"
import { IPMNewVoiceView, isPMNewVoiceView, IParamNewVoice, IVoice } from "../types/type-voice"
import { INPUT_NAME_NICKNAME, INPUT_NAME_CONTENT, INPUT_NAME_PASSWORD, INPUT_FACE_IMOJI, NOT_YET, VOICE_LIMIT_RECENT24H } from "../models"
import { getNewVoiceViewsArg, getVoiceArg } from "./argument-voice"
import { getErrorMsgBlockInView } from "./argument-common"
import { getVoice, putVoice, getVoiceIdArrByTimeRange, newVoice } from "../models/model-voice"
import { hashAndtoggle, getMSFromHours} from "../utils/common.util"
import { isNotEmptyString } from '../utils/typecheck.util'
import { getMessageFromChannelId } from './nls'

export const createVoiceFromSlack = async (web: WebClient, payload: IMyViewSubmissionPayload) => {
  const { team, view } = payload
  const pm: IPMNewVoiceView = JSON.parse(view.private_metadata)
  if (!isPMNewVoiceView(pm)) throw new Error('pm is not IPMNewVoiceView')

  const { channelId } = pm
  const nickname = ''+view.state.values[INPUT_NAME_NICKNAME].s.value
  const content = ''+view.state.values[INPUT_NAME_CONTENT].s.value
  const rawPassword = ''+view.state.values[INPUT_NAME_PASSWORD].s.value
  const faceImoji = ''+view.state.values[INPUT_FACE_IMOJI].so.selected_option.value
  if (!nickname || !content || !rawPassword || !faceImoji || !channelId) throw new Error('Invalid payload')

  const groupId = getGroupId(channelId, team.id, team.enterprise_id)
  const param: IParamNewVoice = {
    nickname, content, faceImoji, rawPassword, platformId: NOT_YET, groupId,
  }
  const [err] = await to<void, Error>(postAndPutSlackVoice(web, param))
  if (err?.message === 'VOICE_LIMIT_RECENT24H') {
    const m = getMessageFromChannelId(channelId)
    const arg = getNewVoiceViewsArg('', pm)
    const errorMsgBlock = getErrorMsgBlockInView(m.STR_FAILED_TO_CREATE_VOICE)
    const view: View = { ...arg.view, blocks: [...arg.view.blocks, errorMsgBlock]}
    return { response_action: 'update', view }
  }

  if (err) throw err
}

export const openViewToPostVoice = async (web: WebClient, triggerId: string, channelId: string, channelName: string='private') => {
  const viewOpenArg = getNewVoiceViewsArg(triggerId, { channelId, channelName })
  await web.views.open(viewOpenArg)
}

export const voteSlackVoice = async (payload: IMyBlockActionPayload, type: 'LIKE' | 'DISLIKE') => {
  const { message, channel, team, user} = payload
  const groupId = getGroupId(channel.id, team.id, team.enterprise_id)
  const voiceId = getVoiceId(groupId, message.ts)
  const v = await getVoice(voiceId)

  const userLikeArr = type === 'LIKE' ? hashAndtoggle(v.userLikeArr, user.id, voiceId) : v.userLikeArr
  const userDislikeArr = type === 'DISLIKE' ? hashAndtoggle(v.userDislikeArr, user.id, voiceId) : v.userDislikeArr
  const newVoice: IVoice = { ...v, userLikeArr, userDislikeArr }

  const updatedVoice = await putVoice(newVoice)
  await axios.post(payload.response_url, getVoiceArg(updatedVoice))
}

export const postAndPutSlackVoice = async (web: WebClient, param: IParamNewVoice) => {
  const now = Date.now()
  const yesterday = new Date(now - getMSFromHours(24)).getTime()
  const arr = await getVoiceIdArrByTimeRange(yesterday, now, param.groupId)
  if (arr.length >= VOICE_LIMIT_RECENT24H) throw new Error('VOICE_LIMIT_RECENT24H')

  const voice = newVoice(param)
  const result = await web.chat.postMessage({ ...getVoiceArg(voice)})

  if (!isNotEmptyString(result?.ts)) throw new Error('Wrong result.ts')

  const voiceId = getVoiceId(param.groupId, result.ts)
  const updatedVoice = await putVoice({ ...voice, voiceId, platformId: result.ts })
  await web.chat.update({ ...getVoiceArg(updatedVoice), ts: result.ts })
}
