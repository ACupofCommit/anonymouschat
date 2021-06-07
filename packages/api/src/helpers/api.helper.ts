import { WebClient } from "@slack/web-api"
import { getGroupId, getToken } from "@anonymouslack/universal/dist/models"
import { IGroup } from "@anonymouslack/universal/dist/types"

export const getClientByGroup = async (group: IGroup) => {
  const groupId = getGroupId(group.channelId, group.teamId, group.gridId)
  const installation = await getToken(group.teamId) || await getToken(group.gridId)
  const token = installation?.bot?.token
  if (!token) throw new Error('Can not get token by groupId: ' + groupId)

  return new WebClient(installation?.bot?.token)
}
