import { Router, Response } from 'express'
import to from 'await-to-js'
import bodyParser from 'body-parser'
import { WebClient } from '@slack/web-api'
import { createLogger } from './logger'
import { isParamNewReplyFromWeb, IParamNewReply } from '../types/type-reply'
import { ERROR_INVALID_PARAMETER, NOT_YET } from './constant'
import { getGroupByWebAccessToken, isWebTokenValid } from './model/model-group'
import { isGroup } from '../types/type-group'
import { checkAndConvertPTsToDotTs, isPTs, isDotTs } from './util'
import { getGroupId } from './model/model-common'
import { isParamNewVoiceFromWeb, IParamNewVoice } from '../types/type-voice'
import { postAndPutReply } from './slack/core-reply'
import { postAndPutSlackVoice } from './slack/core-voice'
import { refreshAllTeam, updateAndShareWebAccessToken } from './slack/core-web-token'

const ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD = process.env.ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD || 'secret'
const logger = createLogger()

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

const sendError = (res: Response, error: string | Error) => {
  if (error instanceof Error) {
    return res.status(500).send({ ok: false, error: error.message })
  }

  const statusCode =
      error === 'NEED_USERS_AGREEMENT' ? 401
    : error === 'EXPIRED_WEB_ACCEESS_TOKEN' ? 403
    : error === ERROR_INVALID_PARAMETER ? 400
    : error === 'WRONG_TS' ? 400
    : error === 'REPLY_LIMIT_RECENT24H' ? 429
    : error === 'VOICE_LIMIT_RECENT24H' ? 429
    : 500

  const errorMessage =
      error === 'NEED_USERS_AGREEMENT' ? '해당 채널 멤버들의 앱 사용 동의가 필요합니다'
    : error === 'EXPIRED_WEB_ACCEESS_TOKEN' ? 'webAccessToken이 유효하지 않습니다'
    : error === ERROR_INVALID_PARAMETER ? 'Invalid parameter'
    : error === 'WRONG_TS' ? 'Wrong TS'
    : error === 'REPLY_LIMIT_RECENT24H' ? '최근 24시간 동안 너무 많은 글을 작성하였습니다'
    : error === 'VOICE_LIMIT_RECENT24H' ? '최근 24시간 동안 너무 많은 글을 작성하였습니다'
    : '알 수 없는 에러: ' + error

  res.status(statusCode).send({ ok: false, errorMessage })
}

router.post('/reply', async (req, res, next) => {
  const { webAccessToken, paramNewReplyFromWeb } = req.body
  if (!isParamNewReplyFromWeb(paramNewReplyFromWeb)) return sendError(res, ERROR_INVALID_PARAMETER)

  const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
  if (err) return sendError(res, err)
  if (!group) return sendError(res, 'CAN_NOT_GET_GROUP')
  if (!group.isPostingAvailable) return sendError(res, 'NEED_USERS_AGREEMENT')

  if (!isWebTokenValid(webAccessToken, group.webAccessTokenExpirationTime)) {
    return sendError(res, 'EXPIRED_WEB_ACCEESS_TOKEN')
  }

  const { threadTs } = paramNewReplyFromWeb
  if (!isPTs(threadTs) && !isDotTs(threadTs)) return sendError(res, 'WRONG_TS')

  const dotTs = isPTs(threadTs) ? checkAndConvertPTsToDotTs(threadTs) : threadTs
  const web = new WebClient(group.accessToken)
  const groupId = getGroupId(group.channelId, group.teamId, group.gridId)
  const param: IParamNewReply = { ...paramNewReplyFromWeb, platformId: NOT_YET, groupId, threadTs: dotTs }

  const [err2] = await to(postAndPutReply(web, param))
  if (err2) return sendError(res, 'REPLY_LIMIT_RECENT24H')

  res.send({ ok: true })
})

router.post('/voice', async (req, res, next) => {
  const { webAccessToken, paramNewVoiceFromWeb } = req.body
  if (!isParamNewVoiceFromWeb(paramNewVoiceFromWeb)) return sendError(res, ERROR_INVALID_PARAMETER)

  const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
  if (err) return sendError(res, err)
  if (!group) return sendError(res, 'CAN_NOT_GET_GROUP')
  if (!group.isPostingAvailable) return sendError(res, 'NEED_USERS_AGREEMENT')

  if (!isWebTokenValid(webAccessToken, group.webAccessTokenExpirationTime)) {
    return sendError(res, 'EXPIRED_WEB_ACCEESS_TOKEN')
  }

  const web = new WebClient(group.accessToken)
  const groupId = getGroupId(group.channelId, group.teamId, group.gridId)
  const param: IParamNewVoice = { ...paramNewVoiceFromWeb, groupId, platformId: NOT_YET }
  const [err2] = await to(postAndPutSlackVoice(web, param))
  if (err2) return sendError(res, err2)

  res.send({ ok: true })
})

router.post('/get-group', async (req, res, next) => {
  const { webAccessToken } = req.body
  const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
  if (err) return sendError(res, err)
  if (!group) return sendError(res, 'CAN_NOT_GET_GROUP')

  res.send({ ok: true, channelId: group.channelId, channelName: group.channelName })
})

router.post('/refresh-daily-web-token', async (req, res, next) => {
  const { password, hours } = req.body
  // Example: hours: 2 일때, 2시간 내 말료될 토큰을 query해서 refresh 시킴.
  // limit가 있어서 모든 토큰이 만료되지는 않음.
  if (password !== ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD) {
    return res.status(404).send({ ok: false, reason: 'check your ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD' })
  }

  const [err, resultArr] = await to(refreshAllTeam(hours || 3))
  if (err) return next(err)

  res.send(resultArr)
})

router.post('/refresh-daily-web-token-for-group', async (req, res, next) => {
  const { password, channelId } = req.body
  if (password !== ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD) {
    return res.status(404).send({ ok: false, reason: 'check your ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD' })
  }

  const [err, result] = await to(updateAndShareWebAccessToken(channelId))
  if (err) return next(err)

  res.send(result)
})

export default router
