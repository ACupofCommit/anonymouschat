import AWS from 'aws-sdk'
import urljoin from 'url-join'

const ANONYMOUSLACK_WEB_ENDPOINT = process.env.ANONYMOUSLACK_WEB_ENDPOINT || '/'
export const getDD = () => {
  const region = process.env.AWS_DEFAULT_REGION
  if (!region) throw new Error('process.env.AWS_DEFAULT_REGION is required')

  const endpoint = process.env.DYNAMO_ENDPOINT || getDDEndpoint(region)
  const httpOptions: AWS.HTTPOptions = { timeout: 5000 }
  const dd = new AWS.DynamoDB({apiVersion: '2012-08-10', region, endpoint, httpOptions })
  return dd
}

export const getDDC = (_region?: string, accessKeyId?: string, secretAccessKey?: string, _endpoint?: string) => {
  const region = _region || process.env.AWS_DEFAULT_REGION
  if (!region) throw new Error('process.env.AWS_DEFAULT_REGION is required')

  const endpoint = _endpoint || process.env.DYNAMO_ENDPOINT || getDDEndpoint(region)
  const httpOptions: AWS.HTTPOptions = { timeout: 5000 }
  const ddc = new AWS.DynamoDB.DocumentClient({ region, endpoint, accessKeyId, secretAccessKey, httpOptions })
  return ddc
}

export const getDDEndpoint = (region: string) => {
  return region.split('-')[0] === 'cn'
    ? `https://dynamodb.${region}.amazonaws.com.cn`
    : `https://dynamodb.${region}.amazonaws.com`
}

export const getUrlToPostVoice = (webAccessToken: string) => {
  return urljoin(ANONYMOUSLACK_WEB_ENDPOINT,`/${webAccessToken}`)
}

type TypeReturnS = [Error] | [null,string]
export const parseAndGetS = (str: string, key: string): TypeReturnS => {
  try {
    const parsed = JSON.parse(str)
    if (parsed[key] && typeof parsed[key] === 'string') return [null,parsed[key]]
    if (parsed[key]) return[new Error("found value. but not 'string'")]

    return[new Error("Not found value by key: " + key)]

  } catch (err) {
    return [err]
  }
}

export const parseWOThrow = <T>(str: string): T | null => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return null
  }
}

/**
 * 'p1578812299006600' 이런 형식의 url에 사용되는 ts 값을
 * '1578812299.006600' 형식의 dot 표현 형식으로 변환
 */
export const checkAndConvertUrlTsToDotTs = (ts: string) => {
  if (!/^p\d+?$/.test(ts)) return ts

  const modifiedThreadTs = [
    ts.substr(1, ts.length-6-1),
    ts.substr(ts.length-6, 6)
  ].join('.')
  return modifiedThreadTs
}
