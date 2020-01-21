import { flatten } from "lodash"
import { WebClient } from "@slack/web-api"
import { getConfigMsgArg } from "./argument-config"
import { getMSFromHours } from "../../common/common-util"
import { getTeamArr } from "../model/model-team"
import { IGroupKeys } from "../../types/type-group"
import { getGroup, putGroup, createWebAccessToken, getExpiredGroupKeysArrByTeamId } from "../model/model-group"
import { canPostMessageIntoChannel, getConfigMsgPermalink } from "./core-common"
import to from "await-to-js"

export const refreshAllTeam = async (h: number) => {
  // 최대 팀당 5개씩 처리하니까,
  // 30분에 한번씩 이 함수가 호출되면 하루 팀당 최대
  // 240개의 group을 커버 할 수 있음
  const teamArr = await getTeamArr()
  const ts = new Date(Date.now() + getMSFromHours(h)).getTime()
  const promiseArr = teamArr.map(t => getExpiredGroupKeysArrByTeamId(t.teamId, ts, 5))

  const tmpArr = await Promise.all(promiseArr)
  const groupKeysArr = flatten(tmpArr)

  const resultArr = await Promise.all(groupKeysArr.map(updateAndShareWebAccessToken))
  return resultArr
}

export const updateAndShareWebAccessToken = async (gk: IGroupKeys) => {
  const group = await getGroup(gk.channelId)
  const updatedGroup = await putGroup({
    ...group,
    webAccessToken: createWebAccessToken(),
    webAccessTokenExpirationTime: Date.now() + getMSFromHours(24),
  })

  const canPost = await canPostMessageIntoChannel(group.accessToken, group.channelId)
  if (!canPost) return { ...gk, ok: false, reason: 'canPost: false' }

  const web = new WebClient(group.accessToken)
  const permalink = await getConfigMsgPermalink(web, group)
  if (!permalink) return { ...gk, ok: false, reason: 'permalink: false' }

  // getConfigMsgARg 에서 남의 AT로 쓰니깐
  const arg = { ...getConfigMsgArg(updatedGroup), ts: group.activationMsgTs }
  const [err] = await to(web.chat.update(arg))
  if (err) return { ...gk, ok: false, reason: 'failed to web.chat.udpate()' }

  return { ...gk, ok: true }
}
