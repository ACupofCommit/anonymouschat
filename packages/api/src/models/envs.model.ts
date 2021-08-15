import { APIEnvs, isAPIEnvs } from "../types/envs.type"

const envs: APIEnvs = process.env as any
if (!isAPIEnvs(envs)) {
  throw new Error('Wrong env')
}

export const {ANONYMOUSLACK_BOT_TOKEN, ANONYMOUSLACK_SIGNING_SECRET} = envs
export const {ANONYMOUSLACK_CLIENT_ID, ANONYMOUSLACK_CLIENT_SECRET} = envs
export const {ANONYMOUSLACK_TABLENAME_PREFIX} = envs
export const {AWS_DEFAULT_REGION} = envs
export const {ENV_SLS_STAGE} = envs
export const {ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD} = envs
export const {ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT} = envs
export const {ANONYMOUSLACK_STATE_SECRET} = envs
export const {ANONYMOUSLACK_CORS_ALLOWLIST} = envs
