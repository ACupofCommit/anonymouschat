import to from 'await-to-js'
import { Router } from 'express'
import bodyParser from 'body-parser'
import { refreshAllTeam } from './slack/core-web-token'

export const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

router.get('/', async (_, res, next) => {
  const [err, groupKeysArr] = await to(refreshAllTeam())
  if (err) return next(err)

  res.send(groupKeysArr)
})
