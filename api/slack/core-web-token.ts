import { flatten } from "lodash"
import { NOT_YET } from "../constant"
import { WebClient } from "@slack/web-api"
import { getConfigMsgArg } from "./argument-config"
import { getMSFromHours } from "../../common/common-util"
import { createLogger } from "../logger"
import { getTeamArr } from "../model/model-team"
import { IGroup } from "../../types/type-group"
import { getExpiredGroupKeysArrByTeamId, getGroup, putGroup, createWebAccessToken } from "../model/model-group"

const logger = createLogger('core-web-token')

export const getExpiredGroupKeysArr = async () => {
  const teamArr = await getTeamArr()

  // 3시간 이내에 만료되는 친구들
  const ts = new Date(Date.now() + getMSFromHours(3)).getTime()
  const promiseArr = teamArr.map( t => getExpiredGroupKeysArrByTeamId(t.teamId, ts))
  return flatten(await Promise.all(promiseArr))
}

export const refreshAllTeam = async () => {
  const groupKeysArr = await getExpiredGroupKeysArr()
  await Promise.all(groupKeysArr.map( async gk => {
    const group = await getGroup(gk.channelId)
    if (group.activationMsgTs === NOT_YET) return

    return updateAndShareWebAccessToken(group)
  }))
  return groupKeysArr
}

export const updateAndShareWebAccessToken = async (group: IGroup) => {
  if (group.activationMsgTs === NOT_YET) throw new Error('Failed to updateAndShareWebAccessToken. group.activationMsgTs === NOT_YET')

  const web = new WebClient(group.accessToken)
  const updatedGroup = await putGroup({
    ...group,
    webAccessToken: createWebAccessToken(),
    webAccessTokenExpirationTime: Date.now() + getMSFromHours(24),
  })

  // TODO: permalink 확인 하고 해야하나
  const arg = { ...getConfigMsgArg(updatedGroup), ts: group.activationMsgTs }
  await web.chat.update(arg)
}
