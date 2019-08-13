import { Request, Response, NextFunction } from "express"
import to from "await-to-js"
import { SlashCommandPayload } from "seratch-slack-types/app-backend/slash-commands"

import { createLogger } from "../logger"
import { putGroup, getOrCreateGetGroup } from "../model/model-group"
import { getSlackAT } from "../model/model-slackAT"
import { isGroup } from "../../types/type-group"
import { canPostMessageIntoChannel, getSlackValidAT } from "../slack/core"
import { getErrorMsgChannelNotFound } from "../slack/argument-config"

const logger = createLogger('handler-valid-token')

export const validTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  const body: SlashCommandPayload  = req.body
  const { channel_id, user_id, team_id, channel_name, enterprise_id } = body
  if (!channel_id || !team_id || !user_id || !channel_name) return next(new Error('Wrong payload in validTokenHandler'))

  const [err1,group] = await to(getOrCreateGetGroup(channel_id, team_id, channel_name, enterprise_id))
  if (err1) return next(err1)
  if (!isGroup(group)) return next(new Error('Wrong group in handler-valid-token'))

  const [_, canPost] = await to(canPostMessageIntoChannel(group.accessToken, channel_id))
  if (canPost) return next()

  const [__, currentUserSlackAT] = await to(getSlackAT(team_id, user_id))
  console.log('111')
  if (currentUserSlackAT) {
  console.log('222')
    const { accessToken } = currentUserSlackAT
    const [err, canPost2] = await to(canPostMessageIntoChannel(accessToken, channel_id))
    if (err) logger.warn(err)
    if (canPost2) {
      console.log(accessToken)
      await putGroup({ ...group, accessToken })
      return next()
    }
  }

  // public 채널이면 team 의 아무 validAT 를 사용 하면됨
  const [___, validOthersAT] = await to(getSlackValidAT(team_id))
  console.log('333')
  if (validOthersAT) {
  console.log('444')
    const [err, canPost2] = await to(canPostMessageIntoChannel(validOthersAT, channel_id))
    if (err) logger.warn(err)
    if (canPost2) {
      await putGroup({ ...group, accessToken: validOthersAT })
      return next()
    }
  }

  res.status(200).send(getErrorMsgChannelNotFound())
}
