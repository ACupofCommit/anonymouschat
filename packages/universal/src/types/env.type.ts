export type EnvSlsStage = 'local' | 'dev' | 'stg' | 'prod'
export const isEnvSlsStage = (o: any): o is EnvSlsStage =>
  ['local','dev','stg','prod'].includes(o)

export interface Envs {
  ENV_SLS_STAGE: EnvSlsStage
  ENV_REVISION: string
}
