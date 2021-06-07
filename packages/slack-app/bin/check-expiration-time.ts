import { getDDC, getDDEndpoint } from '../api/util'
import { isGroupArr, IGroup } from '../types/type-group'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TABLENAME_GROUP } from '../api/constant'
import prettyMilliseconds from 'pretty-ms'

const REGION = process.env.AWS_DEFAULT_REGION
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || getDDEndpoint(REGION)

const TABLENAME = TABLENAME_GROUP
const ddcFrom = getDDC(REGION, ACCESS_KEY, SECRET_KEY, DYNAMODB_ENDPOINT)

const check = async () => {
  const Limit = 200   // 현

  let groupArr: IGroup[] = []
  let params: DocumentClient.ScanInput = { TableName: TABLENAME, Limit }
  while(true) {
    const result = await ddcFrom.scan(params).promise()
    if (!isGroupArr(result.Items)) throw new Error('Items is not GroupArr')

    groupArr = [...groupArr, ...result.Items]
    params.ExclusiveStartKey = result.LastEvaluatedKey

    if (groupArr.length >= Limit) break
    if (!params.ExclusiveStartKey) break
  }

  const now = new Date().getTime()
  groupArr.forEach(group => {
    if (group.webAccessTokenExpirationTime < 0) {
      console.log(`${group.channelId}: ${group.webAccessTokenExpirationTime}`)
      return
    }

    const exp = new Date(group.webAccessTokenExpirationTime).getTime()
    const gap = prettyMilliseconds(exp - now)
    console.log(`${group.channelId}: ${group.webAccessTokenExpirationTime} - ${gap}`)
  })
}

const run = async () => {
  console.log()
  console.log({ REGION, ACCESS_KEY, SECRET_KEY, DYNAMODB_ENDPOINT })
  await check()
}

if (require.main === module) {
  run()
}
