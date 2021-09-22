import { keys, includes } from "lodash"

enum EnumLogLevel {
  error=0,
  warn=1,
  info=2,
  verbose=3,
  debug=4,
  silly=5 ,
}

const isEnumLogLevel = (level: any): level is EnumLogLevel => {
  return includes(keys(EnumLogLevel), level)
}

let level = isEnumLogLevel(process.env.ANONYMOUSCHAT_LOGLEVEL)
  ? EnumLogLevel[process.env.ANONYMOUSCHAT_LOGLEVEL]
  : EnumLogLevel.debug

export const setLevel = (l: EnumLogLevel) => { level = l }
export type TypeLogger = {
  debug: (msg: string | Object) => void
  info: (msg: string | Object) => void
  warn: (msg: string | Object) => void
  error: (msg: string | Object) => void
}

export const createLogger = (type='-') => {
  const logger: TypeLogger = {
    debug: (msg: string | Object) => {
      if (level < EnumLogLevel.debug) return

      msg = typeof msg === 'object' ? JSON.stringify(msg) : msg
      console.log(`DEBUG [${type}] ${msg}`)
    },
    info: (msg: string | Object) => {
      if (level < EnumLogLevel.info) return

      msg = typeof msg === 'object' ? JSON.stringify(msg) : msg
      console.info(`INFO [${type}] ${msg}`)
    },
    warn: (msg: string | Object) => {
      if (level < EnumLogLevel.warn) return

      msg = typeof msg === 'object' ? JSON.stringify(msg) : msg
      console.warn(`WARN [${type}] ${msg}`)
    },
    error: (msg: string | Object) => {
      if (level < EnumLogLevel.error) return

      msg = typeof msg === 'object' ? JSON.stringify(msg) : msg
      console.error(`ERROR [${type}] ${msg}`)
    },
  }
  return logger
}
