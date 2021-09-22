import { EnvSlsStage } from "@anonymouschat/universal/dist/types"
import { isNotEmptyString, isNotNullObject } from "@anonymouschat/universal/dist/utils"

export interface APIEnvs {
  ENV_SLS_STAGE: EnvSlsStage
  ENV_REVISION: string

  ANONYMOUSCHAT_BOT_TOKEN: string
  ANONYMOUSCHAT_SIGNING_SECRET: string
  ANONYMOUSCHAT_CLIENT_ID: string
  ANONYMOUSCHAT_CLIENT_SECRET: string
  ANONYMOUSCHAT_TABLENAME_PREFIX: string
  ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD: string
  ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT: string
  ANONYMOUSCHAT_STATE_SECRET: string
  ANONYMOUSCHAT_CORS_ALLOWLIST: string
  AWS_DEFAULT_REGION: string
}

export const isAPIEnvs = (o: any): o is APIEnvs => {
  const m = o as APIEnvs
  if (!isNotNullObject(m)) return false
  if (!isNotEmptyString(m.ENV_SLS_STAGE)) return false
  if (!isNotEmptyString(m.ENV_REVISION)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_BOT_TOKEN)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_SIGNING_SECRET)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_TABLENAME_PREFIX)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_CLIENT_ID)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_CLIENT_SECRET)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT)) return false
  if (!isNotEmptyString(m.ANONYMOUSCHAT_STATE_SECRET)) return false
  if (typeof m.ANONYMOUSCHAT_CORS_ALLOWLIST !== 'string') return false
  if (!isNotEmptyString(m.AWS_DEFAULT_REGION)) return false

  return true
}
