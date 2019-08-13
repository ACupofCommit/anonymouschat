import { IncomingMessage, ServerResponse } from 'http'
import { Router } from 'express'
import to from 'await-to-js'
import bodyParser from 'body-parser'
import { find, values } from 'lodash'
import { WebClient } from '@slack/web-api'
import { SlashCommandPayload } from 'seratch-slack-types/app-backend/slash-commands'

import { isNotNullObject, isNotEmptyString } from '../common/common-util'
import { getOrCreateGetGroup } from './model/model-group'
import { isGroup } from '../types/type-group'
import { createLogger } from './logger'
import { EnumCommand } from './constant'
import { validTokenHandler } from './middleware/handler-valid-token'
import { postAgreementMesssage, sendHelpMessage, getConfigMsgPermalink } from './slack/core'

interface IMySlashCommandPayload extends SlashCommandPayload {
  team_id: string
  channel_id: string
  user_id: string
  response_url: string
  trigger_id: string
  text: string
}
const isMySlashCommandRequest = (o: any): o is IMySlashCommandPayload => {
  if (!isNotNullObject(o)) return false
  if (!isNotEmptyString(o.team_id)) return false
  if (!isNotEmptyString(o.channel_id)) return false
  if (!isNotEmptyString(o.user_id)) return false
  if (!isNotEmptyString(o.response_url)) return false
  if (!isNotEmptyString(o.trigger_id)) return false

  // user가 typing하는 부분. 빈 문자가 올 수도 있음
  if (typeof o.text !== 'string') return false

  return true
}

const logger = createLogger('command-av')

const getCommandAndText = (text: string) => {
  const commandArr = values(EnumCommand)
  const command = find(commandArr, c => new RegExp(`^${c}\\s?`).test(text))
  const message = command ? text.replace(new RegExp(`^${command}\\s?`), '').trim() : text
  return { command, message }
}

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.use(validTokenHandler)

router.all('/', async (req, res, next) => {
  const body: SlashCommandPayload  = req.body
  if (!isMySlashCommandRequest(body)) return next('Wrong SlashCommandPayload')

  const { team_id, channel_id, user_id, text, trigger_id, enterprise_id, channel_name } = body

  const { command } = getCommandAndText(text)
  logger.debug('command: ' + command)

  const [err0, group] = await to(getOrCreateGetGroup(channel_id, team_id, channel_name, enterprise_id))
  if (err0 || !isGroup(group)) return next(err0 || new Error('Can not get group'))

  const web = new WebClient(group.accessToken)

  const [err2, permalink] = await to(getConfigMsgPermalink(web, group))
  if (err2) return next(err2)

  if (!permalink)  {
    // 컨피그 메시지가 없거나 삭제된 상태. 컨피그 메시지 작성
    const [err] = await to(postAgreementMesssage(web, group))
    return err ? next(err) : res.status(200).end()
  }

  const [err] = await to(sendHelpMessage(web, group, user_id, permalink))
  return err ? next(err) : res.status(200).end()
})

export default router
