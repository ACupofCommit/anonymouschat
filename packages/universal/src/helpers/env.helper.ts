import { Envs, isEnvSlsStage } from "../types/env.type"
import { isNotEmptyString } from "../utils/typecheck.util"

const {
  ENV_SLS_STAGE='local',
  ENV_REVISION='local-server',
} = process.env

export const getEnvs = () => {
  // Through the build-time type check here,
  // environment variables can be used in runtime code without additional type checking.
  if(!isEnvSlsStage(ENV_SLS_STAGE)) throw new Error('Check required env: ENV_SLS_STAGE')
  if(!isNotEmptyString(ENV_REVISION)) throw new Error('Check required env: ENV_REVISION')

  const envs: Envs = {
    ENV_SLS_STAGE,
    ENV_REVISION,
  }

  return envs
}
