import { Router } from 'express'
import bodyParser from 'body-parser'
import { isNotNullObject, isNotEmptyString } from '../common/util'

const isMySlashCommandRequest = (o) => {
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

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.all('/', async (req, res, next) => {
  const body = req.body
  if (!isMySlashCommandRequest(body)) return next('Wrong SlashCommandPayload')

  const { team_id, channel_id, user_id, text } = body
  res.send({ team_id, channel_id, user_id, text })
})

export default router
