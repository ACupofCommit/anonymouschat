import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import to from 'await-to-js'
import { getDD } from '../api/util'
import { TABLENAME_GROUP, TABLENAME_VOICE, TABLENAME_REPLY, TABLENAME_AT, TABLENAME_TEAM } from '../api/constant'

const paramsGroup: CreateTableInput = {
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_GROUP,
  AttributeDefinitions: [
    { AttributeName: 'teamId', AttributeType: 'S' },
    { AttributeName: 'channelId', AttributeType: 'S' },
    { AttributeName: 'accessToken', AttributeType: 'S' },
    { AttributeName: 'webAccessToken', AttributeType: 'S' },
    { AttributeName: 'webAccessTokenExpirationTime', AttributeType: 'N' },
  ],
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' },
  ],
  GlobalSecondaryIndexes: [{
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexTeamId',
    KeySchema: [
      { AttributeName: 'teamId', KeyType: 'HASH' },
    ],
  }, {
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexAccessToken',
    KeySchema: [
      { AttributeName: 'accessToken', KeyType: 'HASH' },
    ],
  }, {
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexWebAccessToken',
    KeySchema: [
      { AttributeName: 'webAccessToken', KeyType: 'HASH' },
    ],
  }, {
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexWebAccessTokenExpirationTime',
    KeySchema: [
      { AttributeName: 'teamId', KeyType: 'HASH' },
      { AttributeName: 'webAccessTokenExpirationTime', KeyType: 'RANGE' },
    ],
  }],
  StreamSpecification: {
    StreamEnabled: false
  },
}

const paramVoice: CreateTableInput = {
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_VOICE,
  AttributeDefinitions: [
    { AttributeName: 'voiceId', AttributeType: 'S' },
    { AttributeName: 'groupId', AttributeType: 'S' },
    { AttributeName: 'platformId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'groupId', KeyType: 'HASH' },
    { AttributeName: 'voiceId', KeyType: 'RANGE' },
  ],
  LocalSecondaryIndexes: [{
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexGroupIdPlatformId', // slack message ts
    KeySchema: [
      { AttributeName: 'groupId', KeyType: 'HASH' },
      { AttributeName: 'platformId', KeyType: 'RANGE' },
    ],
  }],
  StreamSpecification: {
    StreamEnabled: false
  },
}

const paramReply: CreateTableInput = {
  AttributeDefinitions: [
    { AttributeName: 'replyId', AttributeType: 'S' },
    { AttributeName: 'voiceId', AttributeType: 'S' },
    { AttributeName: 'groupId', AttributeType: 'S' },
    { AttributeName: 'platformId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'voiceId', KeyType: 'HASH' },
    { AttributeName: 'replyId', KeyType: 'RANGE' },
  ],
  GlobalSecondaryIndexes: [{
    Projection: { ProjectionType: 'KEYS_ONLY' },
    IndexName: 'IndexGroupIdPlatformId',
    KeySchema: [
      { AttributeName: 'groupId', KeyType: 'HASH' },
      { AttributeName: 'platformId', KeyType: 'RANGE' },
    ],
  }],
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_REPLY,
  StreamSpecification: {
    StreamEnabled: false
  },
}

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

const paramTeam: CreateTableInput = {
  AttributeDefinitions: [
    { AttributeName: 'gridId', AttributeType: 'S' },
    { AttributeName: 'teamId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'gridId', KeyType: 'HASH' },
    { AttributeName: 'teamId', KeyType: 'RANGE' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_TEAM,
  StreamSpecification: {
    StreamEnabled: false,
  },
}

const run = async () => {
  const ddb = getDD()

  const [errGroup, dataGroupV2] = await to(ddb.createTable(paramsGroup).promise())
  if (errGroup) console.log("Error", errGroup)
  else console.log("Table Created: " + paramsGroup.TableName)

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
