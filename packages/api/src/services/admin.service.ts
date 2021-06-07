import { flatten } from "lodash"
import { WebClient } from "@slack/web-api"
import { createLogger, getMSFromHours } from "@anonymouslack/universal/dist/utils"
import { getConfigMsgArg, getConfigMsgPermalink } from "@anonymouslack/universal/dist/core"
import { createWebAccessToken, getExpiredGroupKeysArrByTeamId, getGroup, getTeamArr, putGroup } from "@anonymouslack/universal/dist/models"
import { getClientByGroup } from "../helpers/api.helper"

const logger = createLogger('batch.service')

export class AdminService {
  public async refreshAllTeam(h: number, limit: number) {
    const teamArr = await getTeamArr()
    const ts = new Date(Date.now() + getMSFromHours(h)).getTime()
    const promiseArr = teamArr.map(t => getExpiredGroupKeysArrByTeamId(t.teamId, ts, limit))

    const tmpArr = await Promise.all(promiseArr)
    const groupKeysArr = flatten(tmpArr)
    const promises = groupKeysArr.map(async k => {
      const group = await getGroup(k.channelId)
      const client = await getClientByGroup(group)
      return this.updateAndShareWebAccessToken(client, k.channelId)
    })
    const results = await Promise.all(promises)
    logger.info(JSON.stringify(results, null, 2))
    return results
  }

  public async updateAndShareWebAccessToken(client: WebClient, channelId: string) {
    const group = await getGroup(channelId)
    const updatedGroup = await putGroup({
      ...group,
      webAccessToken: createWebAccessToken(),
      webAccessTokenExpirationTime: Date.now() + getMSFromHours(24),
    })

    const permalink = await getConfigMsgPermalink(client, group)
    if (!permalink) return { channelId, ok: false, reason: 'permalink: false' }

    // getConfigMsgARg 에서 남의 AT로 쓰니깐
    const arg = { ...getConfigMsgArg(updatedGroup), ts: group.activationMsgTs }
    await client.chat.update(arg)

    return { channelId, ok: true }
  }
}
