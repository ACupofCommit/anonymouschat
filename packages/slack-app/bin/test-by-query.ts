import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { getDD, getDDC } from '../src/utils/common.util'
import { TABLENAME_AT, TABLENAME_GROUP, TABLENAME_REPLY, TABLENAME_TEAM, TABLENAME_OAUTH_TOKENS, TABLENAME_VOICE } from '../src/constant'

const run = async () => {
  const ddc = getDDC()

  const teams = await ddc.scan({ TableName: TABLENAME_TEAM, Limit: 300 }).promise()
  console.log(teams)
}

if (require.main === module) {
  run().catch(err => console.error(err))
}
