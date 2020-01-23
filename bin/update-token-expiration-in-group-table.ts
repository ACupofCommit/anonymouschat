import { getDDC, getDDEndpoint, delay } from '../api/util'
import { isGroupArr, IGroup } from '../types/type-group'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TABLENAME_GROUP, NOT_YET } from '../api/constant'

const fakeDDC = {
  put: (o: any) => {
    console.log(o)
    return {
      promise: () => new Promise( (resolve) => resolve() ),
    }
  },
}

const REAL_RUN = process.env.ANONYMOUSLACK_DB_MIG_REAL_RUN === 'true'
const REGION = process.env.AWS_DEFAULT_REGION
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || getDDEndpoint(REGION)

const TABLENAME = TABLENAME_GROUP
const ddcFrom = getDDC(REGION, ACCESS_KEY, SECRET_KEY, DYNAMODB_ENDPOINT)
const ddcTo = REAL_RUN
  ? getDDC(REGION, ACCESS_KEY, SECRET_KEY, DYNAMODB_ENDPOINT)
  : fakeDDC

const updateDB = async () => {
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

  const pArr = groupArr.map(group => {
    // 로그보고 실제에 배포
    if (group.accessToken !== NOT_YET) return
    // if (group.isPostingAvailable) return
    if (group.webAccessTokenExpirationTime < 0) return

    const Item = { ...group, webAccessTokenExpirationTime: -1 }
    return ddcTo.put({ TableName: TABLENAME, Item }).promise()
  })

  await Promise.all(pArr)
}

const run = async () => {
  console.log()
  console.log({ REAL_RUN, REGION, ACCESS_KEY, SECRET_KEY, DYNAMODB_ENDPOINT })
  if (REAL_RUN) {
    console.log('Check above information and if any problem cancel using "Ctrl+c"')
    await delay(12000)
  }
  await updateDB()
}

if (require.main === module) {
  run()
}
