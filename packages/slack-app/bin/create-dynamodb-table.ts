import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { getDD } from '@anonymouschat/universal/dist/utils'
import { TABLENAME_AT, TABLENAME_GROUP, TABLENAME_OAUTH_TOKENS, TABLENAME_REPLY, TABLENAME_TEAM, TABLENAME_VOICE } from '@anonymouschat/universal/dist/models/constants.model'

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

const paramOAuthTokens: CreateTableInput = {
  AttributeDefinitions: [
    { AttributeName: 'key', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'key', KeyType: 'HASH' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_OAUTH_TOKENS,
  StreamSpecification: {
    StreamEnabled: false,
  },
}

export const paramVoice: CreateTableInput = {
  TableName: TABLENAME_VOICE,
  BillingMode: 'PAY_PER_REQUEST',
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

export const paramTeam: CreateTableInput = {
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

export const paramReply: CreateTableInput = {
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

export const paramGroup: CreateTableInput = {
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
    Projection: {
      ProjectionType: 'INCLUDE',
      NonKeyAttributes: ['teamId','webAccessTokenExpirationTime','activationMsgTs'],
    },
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

const run = async () => {
  console.log('hello')
  const ddb = getDD()

  await ddb.createTable(paramGroup).promise()
  console.log("Table Created: " + paramGroup.TableName)

  await ddb.createTable(paramVoice).promise()
  console.log("Table Created: " + paramVoice.TableName)

  await ddb.createTable(paramReply).promise()
  console.log("Table Created: " + paramReply.TableName)

  await ddb.createTable(paramTeam).promise()
  console.log("Table Created: " + paramTeam.TableName)

  await ddb.createTable(paramAT).promise()
  console.log("Table Created: " + paramAT.TableName)

  await ddb.createTable(paramOAuthTokens).promise()
  console.log("Table Created: " + paramOAuthTokens.TableName)
}

if (require.main === module) {
  run().catch(err => console.error(err))
}
