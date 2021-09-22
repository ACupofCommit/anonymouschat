import { AWS_LAMBDA_FUNCTION_MEMORY_SIZE, AWS_LAMBDA_FUNCTION_NAME, AWS_LAMBDA_FUNCTION_VERSION, AWS_REGION, ENV_REVISION, ENV_SLS_STAGE } from "@anonymouschat/universal/dist/models"
import { EnvSlsStage } from "@anonymouschat/universal/dist/types"

export interface Version {
  node: string
  app: string
  slsStage: EnvSlsStage
  AWS_REGION?: string
  AWS_LAMBDA_FUNCTION_NAME?: string
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE?: string
  AWS_LAMBDA_FUNCTION_VERSION?: string
}

export class VersionService {
  public get(): Version {
    return {
      node: process.version,
      app: ENV_REVISION,         // application revision
      slsStage: ENV_SLS_STAGE,   // serverless stage
      AWS_REGION: AWS_REGION,
      AWS_LAMBDA_FUNCTION_NAME: AWS_LAMBDA_FUNCTION_NAME,
      AWS_LAMBDA_FUNCTION_MEMORY_SIZE: AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
      AWS_LAMBDA_FUNCTION_VERSION: AWS_LAMBDA_FUNCTION_VERSION,
    }
  }
}
