import { Installation } from '@slack/oauth'
import { isNotEmptyString, isNotNullObject } from '../utils/typecheck.util'

// team means workspace, enterprise means grid
export type KeyType = 'team' | 'enterprise'

export interface OAuthToken {
  key: string
  keyType: KeyType
  installation: Installation<'v2'>
}

export const isInstallationV2 = (o:Installation): o is Installation<'v2'> => {
  if (!isNotNullObject(o)) return false
  if (o.authVersion !== 'v2') return false

  return true
}

export const isOAuthToken = (o: unknown): o is OAuthToken => {
  const m = o as OAuthToken
  if (!isNotNullObject(m)) return false
  if (!isNotEmptyString(m.key)) return false
  if (!['team','enterprise'].includes(m.keyType)) return false
  if (!isNotNullObject(m.installation)) return false
  return true
}
