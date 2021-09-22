import { APIEnvs, isAPIEnvs } from "../types/envs.type"

const envs: APIEnvs = process.env as any
if (!isAPIEnvs(envs)) {
  throw new Error('Wrong env')
}

export const {ANONYMOUSCHAT_BOT_TOKEN, ANONYMOUSCHAT_SIGNING_SECRET} = envs
export const {ANONYMOUSCHAT_CLIENT_ID, ANONYMOUSCHAT_CLIENT_SECRET} = envs
export const {ANONYMOUSCHAT_TABLENAME_PREFIX} = envs
export const {AWS_DEFAULT_REGION} = envs
export const {ENV_SLS_STAGE} = envs
export const {ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD} = envs
export const {ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT} = envs
export const {ANONYMOUSCHAT_STATE_SECRET} = envs
export const {ANONYMOUSCHAT_CORS_ALLOWLIST} = envs
