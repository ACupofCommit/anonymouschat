import { WebAPIPlatformError } from "@slack/web-api"
import { isNotEmptyString, isNotNullObject } from "../utils/typecheck.util"

export const isWebAPIPlatformError = (o: unknown): o is WebAPIPlatformError => {
  const m = o as WebAPIPlatformError
  if (!isNotNullObject(m)) return false
  if (m.code !== 'slack_webapi_platform_error') return false
  if (m.data.ok !== false) return false
  if (!isNotEmptyString(m.data.error)) return false
  return true
}
