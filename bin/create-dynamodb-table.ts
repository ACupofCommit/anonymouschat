import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import to from 'await-to-js'
import { getDD } from '../api/util'
import { TABLENAME_AT } from '../api/constant'
import { scheme as paramGroup } from '../api/model/model-group'
import { scheme as paramTeam } from '../api/model/model-team'
import { scheme as paramVoice } from '../api/model/model-voice'
import { scheme as paramReply } from '../api/model/model-reply'

const paramAT: CreateTableInput = {
  AttributeDefinitions: [
    { AttributeName: 'ownerId', AttributeType: 'S' },
    { AttributeName: 'accessToken', AttributeType: 'S' },
    { AttributeName: 'teamId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'teamId', KeyType: 'HASH' },
    { AttributeName: 'ownerId', KeyType: 'RANGE' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_AT,
  StreamSpecification: {
    StreamEnabled: false,
  },
  GlobalSecondaryIndexes: [{
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexAccessToken',
    KeySchema: [
      { AttributeName: 'accessToken', KeyType: 'HASH' },
    ],
  }],
}

const run = async () => {
  const ddb = getDD()

  const [errGroup, dataGroupV2] = await to(ddb.createTable(paramGroup).promise())
  if (errGroup) console.log("Error", errGroup)
  else console.log("Table Created: " + paramGroup.TableName)

  const [err2, data2] = await to(ddb.createTable(paramVoice).promise())
  if (err2) console.log("Error", err2)
  else console.log("Table Created: " + paramVoice.TableName)

  const [err3, data3] = await to(ddb.createTable(paramReply).promise())
  if (err3) console.log("Error", err3)
  else console.log("Table Created: " + paramReply.TableName)

  const [err4, data4] = await to(ddb.createTable(paramAT).promise())
  if (err4) console.log("Error", err4)
  else console.log("Table Created: " + paramAT.TableName)

  const [err5, data5] = await to(ddb.createTable(paramTeam).promise())
  if (err5) console.log("Error", err5)
  else console.log("Table Created: " + paramTeam.TableName)
}

if (require.main === module) run()
