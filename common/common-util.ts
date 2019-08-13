import gp from 'generate-password'
import { WebAPIPlatformError } from '@slack/web-api'
import { IFaceImoji } from '../types/type-common'

export const isNotEmptyString = (s: any): s is string => {
  return !!(typeof s === 'string' && s)
}

export const isNotNullObject = (o: any) => {
  return !!(typeof o === 'object' && o !== null)
}

export const getRawPassword = () => gp.generate({ length: 16, numbers: true })

export const getBEHRError = (err: Error | null, functionName?: string) => {
  if (err) return err

  const message = functionName
    ? `${functionName} return no error without value`
    : `Unexpected error. Got no error without value as TypeBetterErrorHandleReturn`
  const ErrorObj = { statusCode: 500, message }
  return ErrorObj
}

export const toggle = (arr: Array<any>, item: any) => {
  // const onTest = true
  // if (onTest) return [ item, ...arr ];

  const idx = arr.indexOf(item)
  return (idx > -1)
    ? [ ...arr.slice(0,idx), ...arr.slice(idx+1)]
    : [ item, ...arr ]
}

export const addItem = (arr: Array<any>, item: any) => {
  const idx = arr.indexOf(item)
  return idx > -1 ? arr : [ item, ...arr ]
}

export const isWebAPIPlatformError = (err: any): err is WebAPIPlatformError => {
  const obj = Object(err)
  if (obj.code !== 'slack_webapi_platform_error') return false
  return true
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
