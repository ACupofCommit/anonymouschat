import { Router } from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'
import querystring from 'querystring'
import to from 'await-to-js';
import { createLogger } from './logger';
import { STR_DENIED_APP, STR_ALLOWED_APP } from './strings';
import { getBEHRError } from '../common/common-util';
import { createSlackAT } from './model/model-slackAT';
import { newTeam, putTeam } from './model/model-team';
import { CONST_SLASH_COMMAND } from './constant';

const logger = createLogger('oauth')

interface IOAuthAcessResult {
  ok: boolean
  access_token: string
  scope: string
  user_id: string
  team_name: string
  team_id: string
  enterprise_id: string | null
}

const isOAuthAccessSuccessResult = (data: any): data is IOAuthAcessResult => {
  if (!data || typeof data !== 'object') return false
  const { ok, access_token, scope, user_id, team_name, team_id, enterprise_id } = data
  if (!ok || typeof ok !== 'boolean') return false
  if (!access_token || typeof access_token !== 'string') return false
  if (!scope || typeof scope !== 'string') return false
  if (!user_id || typeof user_id !== 'string') return false
  if (!team_id || typeof team_id !== 'string') return false
  if (!team_name || typeof team_name !== 'string') return false
  if (enterprise_id !== null && (!enterprise_id || typeof enterprise_id !== 'string')) return false
  return true
}

interface IQuery {
  state: string
  error?: string
  code?: string
}

const isIQuery = (query: IQuery): query is IQuery => {
  if (!query || typeof query !== 'object') return false

  const { state, error, code } = query
  if (typeof state !== 'string') return false
  if (error !== void 0 && typeof error !== 'string') return false
  if (code !== void 0 && typeof code !== 'string') return false
  return true
}

const router = Router()
router.use(bodyParser.urlencoded({ extended: true }))
router.get('/', async (req, res, next) => {
  const query: IQuery = req.query
  if (!isIQuery(query)) return next(new Error('Wrong query'))
  if (query.error === 'access_denied') return res.send(STR_DENIED_APP)

  const { code } = req.query
  const client_id = process.env.ANONYMOUSLACK_CLIENT_ID
  const client_secret = process.env.ANONYMOUSLACK_CLIENT_SECRET
  const url = 'https://slack.com/api/oauth.access'
  const data = querystring.stringify({ client_id, client_secret, code })
  const [err, result] = await to(axios.post<IOAuthAcessResult>(url, data))
  if (err || !result) return next(getBEHRError(err, 'axios.post'))
  if (!isOAuthAccessSuccessResult(result.data)) return next(getBEHRError(err, 'result.data is not success'))

  const { access_token, scope, team_id, user_id, team_name, enterprise_id } = result.data
  const [err2, slackAT] = await to(createSlackAT(team_id, user_id, access_token, scope))
  if (err2 || !slackAT) return next(getBEHRError(err2, 'createSlackAT'))

  const team = newTeam(team_id, team_name, enterprise_id)
  const [err3] = await to(putTeam(team))
  if (err3) return next(err3)

  const strAllowedApp = STR_ALLOWED_APP.replace('%s', CONST_SLASH_COMMAND)
  res.send(`<h1>${strAllowedApp}</h1>`)
})

export default router
