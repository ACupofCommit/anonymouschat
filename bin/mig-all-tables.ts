import { getDDC, getDDEndpoint, delay } from '../api/util'
import { isArray } from 'lodash-es'

const fakeDDC = {
  put: (p: any) => {
    console.log(JSON.stringify(p, null, 2))
    return { promise: () => {} }
  }
}

const REAL_RUN = process.env.ANONYMOUSLACK_MIG_REAL_RUN === 'true'

const FROM_REGION = process.env.ANONYMOUSLACK_MIG_FROM_REGION
const FROM_ACCESS_KEY = process.env.ANONYMOUSLACK_MIG_FROM_ACCESS_KEY
const FROM_SECRET_KEY = process.env.ANONYMOUSLACK_MIG_FROM_SECRET_KEY
const FROM_TABLENAME_TEAM = process.env.ANONYMOUSLACK_MIG_FROM_TABLENAME_TEAM
const FROM_TABLENAME_AT = process.env.ANONYMOUSLACK_MIG_FROM_TABLENAME_AT
const FROM_TABLENAME_GROUP = process.env.ANONYMOUSLACK_MIG_FROM_TABLENAME_GROUP
const FROM_TABLENAME_VOICE = process.env.ANONYMOUSLACK_MIG_FROM_TABLENAME_VOICE
const FROM_TABLENAME_REPLY = process.env.ANONYMOUSLACK_MIG_FROM_TABLENAME_REPLY
const FROM_DYNAMODB_ENDPOINT = process.env.ANONYMOUSLACK_MIG_FROM_DYNAMODB_ENDPOINT || getDDEndpoint(FROM_REGION)

const TO_REGION = process.env.ANONYMOUSLACK_MIG_TO_REGION
const TO_ACCESS_KEY = process.env.ANONYMOUSLACK_MIG_TO_ACCESS_KEY
const TO_SECRET_KEY = process.env.ANONYMOUSLACK_MIG_TO_SECRET_KEY
const TO_TABLENAME_TEAM = process.env.ANONYMOUSLACK_MIG_TO_TABLENAME_TEAM
const TO_TABLENAME_AT = process.env.ANONYMOUSLACK_MIG_TO_TABLENAME_AT
const TO_TABLENAME_GROUP = process.env.ANONYMOUSLACK_MIG_TO_TABLENAME_GROUP
const TO_TABLENAME_VOICE = process.env.ANONYMOUSLACK_MIG_TO_TABLENAME_VOICE
const TO_TABLENAME_REPLY = process.env.ANONYMOUSLACK_MIG_TO_TABLENAME_REPLY
const TO_DYNAMODB_ENDPOINT = process.env.ANONYMOUSLACK_MIG_TO_DYNAMODB_ENDPOINT || getDDEndpoint(TO_REGION)

const ddcFrom = getDDC(FROM_REGION, FROM_ACCESS_KEY, FROM_SECRET_KEY, FROM_DYNAMODB_ENDPOINT)

const ddcTo = REAL_RUN
  ? getDDC(TO_REGION, TO_ACCESS_KEY, TO_SECRET_KEY, TO_DYNAMODB_ENDPOINT)
  : fakeDDC

const migTable = async (tableNameFrom: string, tableNameTo: string) => {
  const Limit = 200
  const { Items } = await ddcFrom.scan({ TableName: tableNameFrom, Limit }).promise()
  if (!isArray(Items)) throw new Error('Items is not Array')

  const pArr = Items.map(Item => ddcTo.put({ TableName: tableNameTo, Item }).promise())
  await Promise.all(pArr)
}

const run = async () => {
  const infoFrom = {
    FROM_REGION,
    FROM_ACCESS_KEY,
    FROM_SECRET_KEY,
    FROM_TABLENAME_TEAM,
    FROM_TABLENAME_AT,
    FROM_TABLENAME_GROUP,
    FROM_TABLENAME_VOICE,
    FROM_TABLENAME_REPLY,
    FROM_DYNAMODB_ENDPOINT,
  }

  const infoTo = {
    TO_REGION,
    TO_ACCESS_KEY,
    TO_SECRET_KEY,
    TO_TABLENAME_TEAM,
    TO_TABLENAME_AT,
    TO_TABLENAME_GROUP,
    TO_TABLENAME_VOICE,
    TO_TABLENAME_REPLY,
    TO_DYNAMODB_ENDPOINT,
  }

  console.log(JSON.stringify(infoFrom, null, 2))
  console.log(JSON.stringify(infoTo, null, 2))
  console.log()
  if (REAL_RUN) {
    console.log('Check above information and if any problem cancel using "Ctrl+c"')
    await delay(12000)
  }

  if (FROM_TABLENAME_TEAM && TO_TABLENAME_TEAM) {
    console.log('---------------- getAndMig Team')
    await migTable(FROM_TABLENAME_TEAM, TO_TABLENAME_TEAM)
  }

  if (FROM_TABLENAME_AT && FROM_TABLENAME_AT) {
    console.log('---------------- runMigrate AT')
    await migTable(FROM_TABLENAME_AT, TO_TABLENAME_AT)
  }

  if (FROM_TABLENAME_GROUP && TO_TABLENAME_GROUP) {
    console.log('---------------- runMigrate Group')
    await migTable(FROM_TABLENAME_GROUP, TO_TABLENAME_GROUP)
  }

  if (FROM_TABLENAME_VOICE && TO_TABLENAME_VOICE) {
    console.log('---------------- runMigrate Voice')
    await migTable(FROM_TABLENAME_VOICE, TO_TABLENAME_VOICE)
  }

  if (FROM_TABLENAME_REPLY && TO_TABLENAME_REPLY) {
    console.log('---------------- runMigrate Reply')
    await migTable(FROM_TABLENAME_REPLY, TO_TABLENAME_REPLY)
  }
}

if (require.main === module) {
  run()
}
