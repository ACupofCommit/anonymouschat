import { flatten } from "lodash"
import { WebClient } from "@slack/web-api"
import { getConfigMsgArg } from "./argument-config"
import { getMSFromHours } from "../../common/common-util"
import { getTeamArr } from "../model/model-team"
import { IGroupKeys } from "../../types/type-group"
import { getGroup, putGroup, createWebAccessToken, getExpiredGroupKeysArrByTeamId } from "../model/model-group"
import { canPostMessageIntoChannel, getConfigMsgPermalink } from "./core-common"
import to from "await-to-js"
import { createLogger } from "../logger"

const logger = createLogger('core-web-token')

const NUMBER_OF_GROUPS_IN_A_TEAM_TO_RENEW_TOKEN_AT_ONCE = 3

export const refreshAllTeam = async (h: number) => {
  // Example: 5분에 한번씩 이 함수가 호출되면서 최대 팀당 3개씩 처리하면,
  // 1시간에 18그룹, 하루 팀당 864개 그룹을 커버 할 수 있음.
  const teamArr = await getTeamArr()
  const ts = new Date(Date.now() + getMSFromHours(h)).getTime()
  const limit = NUMBER_OF_GROUPS_IN_A_TEAM_TO_RENEW_TOKEN_AT_ONCE
  const promiseArr = teamArr.map(t => getExpiredGroupKeysArrByTeamId(t.teamId, ts, limit))

  const tmpArr = await Promise.all(promiseArr)
  const groupKeysArr = flatten(tmpArr)

  const resultArr = await Promise.all(groupKeysArr.map(updateAndShareWebAccessToken))
  logger.info(JSON.stringify(resultArr, null, 2))
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
