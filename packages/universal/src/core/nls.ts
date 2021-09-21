import memoizee from 'memoizee'
import ms from 'ms'
import {messages as ko} from '../messages/ko'
import {messages as en} from '../messages/en'
import { Messages } from '../types/messages'
import { LCA2 } from '../types'

export const getMessage = (lca2: LCA2) => {
  // return lca == 'en' ? en : ko
  return lca2 == 'en' ? ko : en
}

export const getString = (key: keyof Messages, lca2: LCA2) => {
  const messages = getMessage(lca2)
  return messages[key]
}

const _getMessageFromChannelId = (channelId: string, lca2?: LCA2) => {
  return getMessage(lca2 ? lca2 : 'en')
}

const normalizer = (args: [channelId: string]) => args[0]

export const getMessageFromChannelId = memoizee(_getMessageFromChannelId, {
  normalizer,
  maxAge: ms('10s'),
  max: 1000,
})
