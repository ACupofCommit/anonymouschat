import { EnvSlsStage } from "@anonymouslack/universal/dist/types"
import { isNotEmptyString, isNotNullObject } from "@anonymouslack/universal/dist/utils"

export interface APIEnvs {
  ENV_SLS_STAGE: EnvSlsStage
  ENV_REVISION: string

  ANONYMOUSLACK_BOT_TOKEN: string
  ANONYMOUSLACK_SIGNING_SECRET: string
  ANONYMOUSLACK_CLIENT_ID: string
  ANONYMOUSLACK_CLIENT_SECRET: string
  ANONYMOUSLACK_TABLENAME_PREFIX: string
  ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD: string
  ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT: string
  ANONYMOUSLACK_STATE_SECRET: string
  ANONYMOUSLACK_CORS_ALLOWLIST: string
  AWS_DEFAULT_REGION: string
}

export const isAPIEnvs = (o: any): o is APIEnvs => {
  const m = o as APIEnvs
  if (!isNotNullObject(m)) return false
  if (!isNotEmptyString(m.ENV_SLS_STAGE)) return false
  if (!isNotEmptyString(m.ENV_REVISION)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_BOT_TOKEN)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_SIGNING_SECRET)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_TABLENAME_PREFIX)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_CLIENT_ID)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_CLIENT_SECRET)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT)) return false
  if (!isNotEmptyString(m.ANONYMOUSLACK_STATE_SECRET)) return false
  if (typeof m.ANONYMOUSLACK_CORS_ALLOWLIST !== 'string') return false
  if (!isNotEmptyString(m.AWS_DEFAULT_REGION)) return false

  return true
}
