import { includes, values } from "lodash"
import { Envs } from "../types/env.type"

// The `as any` type assumption can be used only when the type check completion is guaranteed at build time.

// You can do this by adding a type checking codes to the `serverless.ts` file.
const envs: Envs = process.env as any
export const ENV_SLS_STAGE = envs.ENV_SLS_STAGE
export const ENV_REVISION = envs.ENV_REVISION

// Using AWS Lambda environment variables
// https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
export const AWS_REGION = process.env.AWS_REGION
export const AWS_LAMBDA_FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
export const AWS_LAMBDA_FUNCTION_MEMORY_SIZE = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
export const AWS_LAMBDA_FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION

const TABLENAME_PREFIX = process.env.ANONYMOUSLACK_TABLENAME_PREFIX || 'Anonymouslack'
export const TABLENAME_TEAM = `${TABLENAME_PREFIX}-Team`
export const TABLENAME_GROUP = `${TABLENAME_PREFIX}-Group-v2`
export const TABLENAME_VOICE = `${TABLENAME_PREFIX}-Voice`
export const TABLENAME_REPLY = `${TABLENAME_PREFIX}-Reply`
export const TABLENAME_AT = `${TABLENAME_PREFIX}-AT`
export const TABLENAME_OAUTH_TOKENS = `${TABLENAME_PREFIX}-OAuth-Tokens`

export const ERROR_INVALID_PARAMETER = 'ERROR_INVALID_PARAMETER'
export const ERROR_CAN_NOT_QUERY_GROUP_BY_WEB_ACCESS_TOKEN = 'ERROR_CAN_NOT_QUERY_GROUP_BY_WEB_ACCESS_TOKEN'
export const ERROR_CAN_NOT_GET_GROUP_BY_WEB_ACCESS_TOKEN = 'ERROR_CAN_NOT_GET_GROUP_BY_WEB_ACCESS_TOKEN'

export const NOT_YET = '__NOT_YET__'
export const NOT_GRID = '__NOT_GRID__'
export const UNKNOWN_CHANNEL_NAME = '__UNKOWN_CHANNEL_NAME__'

// Actions
export const SHORTCUT_START                      = 'SHORTCUT_START'
export const ACTION_SUBMISSION_INIT              = 'ACTION_SUBMISSION_INIT'

export const ACTION_OPEN_VIEW_DELETE             = 'ACTION_OPEN_VIEW_DELETE'
export const ACTION_SUBMISSION_VOICE             = 'ACTION_SUBMISSION_VOICE'
export const ACTION_SUBMISSION_REPLY             = 'ACTION_SUBMISSION_REPLY'
export const ACTION_SUBMISSION_DELETE            = 'ACTION_SUBMISSION_DELETE'

export const ACTION_OPEN_DIALOG_VOICE            = 'ACTION_OPEN_DIALOG_VOICE'
export const ACTION_OPEN_DIALOG_REPLY            = 'ACTION_OPEN_DIALOG_REPLY'
export const ACTION_VOTE_REPLY_LIKE              = 'ACTION_VOTE_REPLY_LIKE'
export const ACTION_VOTE_REPLY_DISLIKE           = 'ACTION_VOTE_REPLY_DISLIKE'
export const ACTION_VOTE_VOICE_LIKE              = 'ACTION_VOTE_VOICE_LIKE'
export const ACTION_VOTE_VOICE_DISLIKE           = 'ACTION_VOTE_VOICE_DISLIKE'
export const ACTION_VOTE_REPORT                  = 'ACTION_VOTE_REPORT'
export const ACTION_APP_USE_AGREEMENT            = 'ACTION_APP_USE_AGREEMENT'
export const ACTION_APP_FORCE_ACTIVATE           = 'ACTION_APP_FORCE_ACTIVATE'
export const ACTION_APP_FORCE_DEACTIVATE         = 'ACTION_APP_FORCE_DEACTIVATE'
export const ACTION_SHOW_DEACTIVATE_WARNING      = 'ACTION_SHOW_DEACTIVATE_WARNING'
export const ACTION_ON_MORE_OPEN_VIEW_REPLY      = 'ACTION_ON_MORE_OPEN_VIEW_REPLY'

// Compatible actions
export const ACTION_VOTE_USERREPLY_LIKE          = 'ACTION_VOTE_USERREPLY_LIKE'
export const ACTION_VOTE_USERREPLY_DISLIKE       = 'ACTION_VOTE_USERREPLY_DISLIKE'
export const ACTION_OPEN_DIALOG_DELETE_USERREPLY = 'ACTION_OPEN_DIALOG_DELETE_USERREPLY'
export const ACTION_OPEN_DIALOG_DELETE_VOICE     = 'ACTION_OPEN_DIALOG_DELETE_VOICE'
export const ACTION_OPEN_DIALOG_DELETE_REPLY     = 'ACTION_OPEN_DIALOG_DELETE_REPLY'


export const ACTIVATION_QUORUM = 3
export const VOICE_LIMIT_RECENT24H = 20

export const INPUT_NAME_NICKNAME = 'messagebox_nickname'
export const INPUT_NAME_PASSWORD = 'messagebox_password'
export const INPUT_NAME_CONTENT = 'messagebox_content'
export const INPUT_FACE_IMOJI = 'select_face_imoji'

export const password_min_length = 4
export const password_max_length = 30
export const nickname_min_length = 1
export const nickname_max_length = 20
export const REPORT_MAX_ALLOWED_LENGTH = 5

export const isEnumCommand = (command: any): command is EnumCommand => {
  return includes(values(EnumCommand), command)
}
export enum EnumCommand { help='help' }

const getSlashCommand = (str?: string) => {
  if (!str || str === '/') return `/anonymouslack`
  return /^\//.test(str) ? str : '/' + str
}
export const CONST_SLASH_COMMAND = getSlashCommand(process.env.ANONYMOUSLACK_SLASH_COMMAND)
export const CONST_APP_NAME = process.env.ANONYMOUSLACK_APP_NAME || 'Anonymouslack'

// scopes
// const scopes: ['app_mentions:read','chat:write','chat:write.customize','im:write','commands'],
