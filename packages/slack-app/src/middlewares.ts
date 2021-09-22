import { getMessage, getMessageFromChannelId } from "@anonymouschat/universal/dist/core/nls"
import { getOrCreateGetGroup } from "@anonymouschat/universal/dist/models"
import { IGroup, ResponseUrl } from "@anonymouschat/universal/dist/types"
import { parseWOThrow } from "@anonymouschat/universal/dist/utils"
import { AnyMiddlewareArgs, Middleware } from "@slack/bolt"

export const setGroupAndMessages: Middleware<AnyMiddlewareArgs> = async ({
  payload,client,context,body,next
}) => {
  const {team, user} = body

  const responseUrl = (body as any).response_urls?.[0] as ResponseUrl
  let group: IGroup | null = null
  if (responseUrl) {
    group = await getOrCreateGetGroup(responseUrl.channel_id, team.id)
  } else if ((body as any).view) {
    const parsed = parseWOThrow((body as any).view.private_metadata)
    const channelId = parsed ? (parsed as any).channelId : "";
    if (channelId) {
      group = await getOrCreateGetGroup(channelId, team.id)
    }
  }

  context.group = group
  context.messages = group
    ? getMessageFromChannelId(group.channelId, group.lca2)
    : getMessage('en')

  if (next) {
    await next()
  }
}
