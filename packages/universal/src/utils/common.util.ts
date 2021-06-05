import sha256 from 'crypto-js/sha256';
import * as gp from 'generate-password'
import { IFaceImoji } from '../types/type-common'
import AWS from 'aws-sdk'
import urljoin from 'url-join'

const ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT = process.env.ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT || '/'
export const getDD = (_region?: string, accessKeyId?: string, secretAccessKey?: string, _endpoint?: string) => {
  const region = _region || process.env.AWS_DEFAULT_REGION || 'us-west-2'
  if (!region) throw new Error('process.env.AWS_DEFAULT_REGION is required')

  const endpoint = _endpoint || process.env.DYNAMO_ENDPOINT || getDDEndpoint(region)
  const httpOptions: AWS.HTTPOptions = { timeout: 3000 }
  const dd = new AWS.DynamoDB({apiVersion: '2012-08-10', region, endpoint, accessKeyId, secretAccessKey, httpOptions })
  return dd
}

export const getDDC = (_region?: string, accessKeyId?: string, secretAccessKey?: string, _endpoint?: string) => {
  const region = _region || process.env.AWS_DEFAULT_REGION || 'us-west-2'
  if (!region) throw new Error('process.env.AWS_DEFAULT_REGION is required')

  const endpoint = _endpoint || process.env.DYNAMO_ENDPOINT || getDDEndpoint(region)
  const httpOptions: AWS.HTTPOptions = { timeout: 3000, connectTimeout: 3000 }
  const ddc = new AWS.DynamoDB.DocumentClient({ region, endpoint, accessKeyId, secretAccessKey, httpOptions, maxRetries: 5 })
  return ddc
}

export const getDDEndpoint = (region: string) => {
  return region.split('-')[0] === 'cn'
    ? `https://dynamodb.${region}.amazonaws.com.cn`
    : `https://dynamodb.${region}.amazonaws.com`
}

export const getUrlToPostVoice = (webAccessToken: string) => {
  return urljoin(ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT,`/${webAccessToken}`)
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
  if (!isPTs(ts)) throw new Error('Wrong pXXXX ts format')

  const modifiedThreadTs = [
    ts.substr(1, ts.length-6-1),
    ts.substr(ts.length-6, 6)
  ].join('.')
  return modifiedThreadTs
}

export const isPTs = (ts: string) => /^p\d+?$/.test(ts)
export const isDotTs = (ts: string) => /^\d+?\.\d+?$/.test(ts)

export const getTheradTs = (ts: string, threadTs?: string) => {
  if (!threadTs) return ts
  return threadTs === ts ? ts : threadTs
}

export const isReplyByTsThreadTs = (ts: string, threadTs?: string) => {
  // reply 인지 voice 인지 ts, threadTs로 구분
  // true 이면 reply, false 이면 voice
  return threadTs && ts !== threadTs
}

export const delay = (ms: number) => new Promise(resolve => {
  setTimeout(resolve, ms)
})

export const getRawPassword = () => gp.generate({ length: 16, numbers: true })

export const getBEHRError = (err: Error | null, functionName?: string) => {
  if (err) return err

  const message = functionName
    ? `${functionName} return no error without value`
    : `Unexpected error. Got no error without value as TypeBetterErrorHandleReturn`
  const ErrorObj = { statusCode: 500, message }
  return ErrorObj
}

export const sha256Hash = (str: string, salt: string) => {
  return sha256(`${str}:${salt}`).toString()
}

export const hashAndtoggle = (arr: Array<any>, str: string, salt: string) => {
  const hashedStr = sha256Hash(str, salt)
  const idx = arr.indexOf(hashedStr)
  return (idx > -1)
    ? [ ...arr.slice(0,idx), ...arr.slice(idx+1)]
    : [ hashedStr, ...arr ]
}

export const getMSFromHours = (h: number) => {
  const ms = h * 60 * 60 * 1000
  if (isNaN(h)) throw new Error('ms is NaN')

  return ms
}

export const getFaceImojiList = (): IFaceImoji[] => {
  return [
    { value: ':grin:', label: '😁 grin' },
    { value: ':joy:', label: '😂 joy' },
    { value: ':smiley:', label: '😃 smiley' },
    { value: ':smile:', label: '😄 smile' },
    { value: ':sweat_smile:', label: '😅 sweat_smile' },
    { value: ':laughing:', label: '😆 laughing' },
    { value: ':wink:', label: '😉 wink' },
    { value: ':blush:', label: '😊 blush' },
    { value: ':yum:', label: '😋 yum' },
    { value: ':relieved:', label: '😌 relieved' },
    { value: ':heart_eyes:', label: '😍 heart_eyes' },
    { value: ':smirk:', label: '😏 smirk' },
    { value: ':unamused:', label: '😒 unamused' },
    { value: ':sweat:', label: '😓 sweat' },
    { value: ':pensive:', label: '😔 pensive' },
    { value: ':confounded:', label: '😖 confounded' },
    { value: ':kissing_heart:', label: '😘 kissing_heart' },
    { value: ':kissing_closed_eyes:', label: '😚 kissing_closed_eyes' },
    { value: ':stuck_out_tongue_winking_eye:', label: '😜 stuck_out_tongue_winking_eye' },
    { value: ':stuck_out_tongue_closed_eyes:', label: '😝 stuck_out_tongue_closed_eyes' },
    { value: ':disappointed:', label: '😞 disappointed' },
    { value: ':angry:', label: '😠 angry' },
    { value: ':rage:', label: '😡 rage' },
    { value: ':cry:', label: '😢 cry' },
    { value: ':persevere:', label: '😣 persevere' },
    { value: ':triumph:', label: '😤 triumph' },
    { value: ':disappointed_relieved:', label: '😥 disappointed_relieved' },
    { value: ':fearful:', label: '😨 fearful' },
    { value: ':weary:', label: '😩 weary' },
    { value: ':sleepy:', label: '😪 sleepy' },
    { value: ':tired_face:', label: '😫 tired_face' },
    { value: ':sob:', label: '😭 sob' },
    { value: ':cold_sweat:', label: '😰 cold_sweat' },
    { value: ':scream:', label: '😱 scream' },
    { value: ':astonished:', label: '😲 astonished' },
    { value: ':flushed:', label: '😳 flushed' },
    { value: ':dizzy_face:', label: '😵 dizzy_face' },
    { value: ':mask:', label: '😷 mask' },
    { value: ':smile_cat:', label: '😸 smile_cat' },
    { value: ':joy_cat:', label: '😹 joy_cat' },
    { value: ':smiley_cat:', label: '😺 smiley_cat' },
    { value: ':heart_eyes_cat:', label: '😻 heart_eyes_cat' },
    { value: ':smirk_cat:', label: '😼 smirk_cat' },
    { value: ':kissing_cat:', label: '😽 kissing_cat' },
    { value: ':pouting_cat:', label: '😾 pouting_cat' },
    { value: ':crying_cat_face:', label: '😿 crying_cat_face' },
    { value: ':scream_cat:', label: '🙀 scream_cat' },
    { value: ':no_good:', label: '🙅 no_good' },
    { value: ':ok_woman:', label: '🙆 ok_woman' },
    { value: ':bow:', label: '🙇 bow' },
    { value: ':see_no_evil:', label: '🙈 see_no_evil' },
    { value: ':hear_no_evil:', label: '🙉 hear_no_evil' },
    { value: ':speak_no_evil:', label: '🙊 speak_no_evil' },
    { value: ':raising_hand:', label: '🙋 raising_hand' },
    { value: ':grinning:', label: '😀 grinning' },
    { value: ':innocent:', label: '😇 innocent' },
    { value: ':smiling_imp:', label: '😈 smiling_imp' },
    { value: ':sunglasses:', label: '😎 sunglasses' },
    { value: ':neutral_face:', label: '😐 neutral_face' },
    { value: ':expressionless:', label: '😑 expressionless' },
    { value: ':confused:', label: '😕 confused' },
    { value: ':kissing:', label: '😗 kissing' },
    { value: ':kissing_smiling_eyes:', label: '😙 kissing_smiling_eyes' },
    { value: ':stuck_out_tongue:', label: '😛 stuck_out_tongue' },
    { value: ':worried:', label: '😟 worried' },
    { value: ':frowning:', label: '😦 frowning' },
    { value: ':anguished:', label: '😧 anguished' },
    { value: ':grimacing:', label: '😬 grimacing' },
    { value: ':open_mouth:', label: '😮 open_mouth' },
    { value: ':hushed:', label: '😯 hushed' },
    { value: ':sleeping:', label: '😴 sleeping' },
    { value: ':no_mouth:', label: '😶 no_mouth' },
  ]
}
