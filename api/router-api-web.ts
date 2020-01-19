import { Router } from 'express'
import to from 'await-to-js'
import bodyParser from 'body-parser'
import { WebClient } from '@slack/web-api'
import { createLogger } from './logger'
import { isParamNewReplyFromWeb, IParamNewReply } from '../types/type-reply'
import { ERROR_INVALID_PARAMETER, NOT_YET } from './constant'
import { getGroupByWebAccessToken } from './model/model-group'
import { isGroup } from '../types/type-group'
import { checkAndConvertUrlTsToDotTs } from './util'
import { getGroupId } from './model/model-common'
import { isParamNewVoiceFromWeb, IParamNewVoice } from '../types/type-voice'
import { postAndPutReply } from './slack/core-reply'
import { postAndPutSlackVoice } from './slack/core-voice'

const logger = createLogger()

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

router.post('/reply', async (req, res, next) => {
  const { webAccessToken, paramNewReplyFromWeb } = req.body
  if (!isParamNewReplyFromWeb(paramNewReplyFromWeb)) {
    const msg = { code: ERROR_INVALID_PARAMETER, message: 'Invalid parameter' }
    return res.status(400).send(msg)
  }

  const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
  if (err || !isGroup(group)) return next(err || new Error('group is not IGroup'))

  if (Date.now() > group.webAccessTokenExpirationTime) {
    // double check
    return res.status(400).send({ ok: false, error: 'EXPIRED_WEB_ACCEESS_TOKEN' })
  }

  const { threadTs } = paramNewReplyFromWeb
  const modifiedThreadTs = checkAndConvertUrlTsToDotTs(threadTs)

  const web = new WebClient(group.accessToken)
  const groupId = getGroupId(group.channelId, group.teamId, group.gridId)
  const param: IParamNewReply = { ...paramNewReplyFromWeb, platformId: NOT_YET, groupId, threadTs: modifiedThreadTs }

  const [err2] = await to(postAndPutReply(web, param))
  if ((err2 || {}).message === 'REPLY_LIMIT_RECENT24H') {
    return res.status(500).send({ ok: false, errorMessage: err2.message })
  }

  if (err2) return res.status(500).send({ ok: false, errorMessage: err2.message })

  res.send({ ok: true })
})

router.post('/voice', async (req, res, next) => {
  const { webAccessToken, paramNewVoiceFromWeb } = req.body
  if (!isParamNewVoiceFromWeb(paramNewVoiceFromWeb)) {
    const msg = { code: ERROR_INVALID_PARAMETER, message: 'Invalid parameter' }
    return res.status(400).send(msg)
  }

  const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
  if (err || !isGroup(group)) return next(err || new Error('group is not IGroup'))

  if (Date.now() > group.webAccessTokenExpirationTime) {
    // double check
    return res.status(400).send({ ok: false, error: 'EXPIRED_WEB_ACCEESS_TOKEN' })
  }

  const web = new WebClient(group.accessToken)
  const groupId = getGroupId(group.channelId, group.teamId, group.gridId)
  const param: IParamNewVoice = { ...paramNewVoiceFromWeb, groupId, platformId: NOT_YET }
  const [err2] = await to(postAndPutSlackVoice(web, param))
  if ((err2 || {}).message === 'REPLY_LIMIT_RECENT24H') {
    return res.status(500).send({ ok: false, errorMessage: err2.message })
  }

  if (err2) return res.status(500).send({ ok: false, errorMessage: err2.message })

  res.send({ ok: true })
})

router.post('/get-group', async (req, res, next) => {
  const { webAccessToken } = req.body
  const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
  if (err || !isGroup(group)) return next(err || new Error('group is not IGroup'))

  res.send({ ok: true, channelId: group.channelId, channelName: group.channelName })
})

export default router
