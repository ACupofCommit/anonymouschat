import {ENV_REVISION} from '../models/constants.model'

export const getDynamoDBEndpoint = (region: string=ENV_REVISION, endpoint?: string) => {
  if (endpoint) return endpoint

  return ENV_REVISION.split('-')[0] === 'cn'
    ? `https://dynamodb.${region}.amazonaws.com.cn`
    : `https://dynamodb.${region}.amazonaws.com`
}
