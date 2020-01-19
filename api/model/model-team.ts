import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../logger'
import { getDDC } from '../util'
import { isTeamArr, ITeam } from '../../types/type-team'
import { NOT_GRID, TABLENAME_TEAM, NOT_YET } from '../constant'

const TableName = TABLENAME_TEAM
const ddc = getDDC()
const logger = createLogger('team')

export const getTeamArr = async () => {
  const params: DocumentClient.QueryInput = { TableName : TableName, Limit: 300 }
  const result = await ddc.scan(params).promise()
  if (!result || !isTeamArr(result.Items)) throw new Error('Can not get teamArr')
  return result.Items
}

export const getTeamArrByGridId = async (gridId: string) => {
  const params: DocumentClient.QueryInput = {
    TableName : TableName,
    ExpressionAttributeValues: { ":gridId": gridId },
    KeyConditionExpression: "gridId = :gridId",
    Limit: 300,
  }
  const result = await ddc.query(params).promise()
  if (!result || !isTeamArr(result.Items)) throw new Error('Can not get teamArr by gridId: ' + gridId)

  return result.Items
}

export const newTeam = (teamId: string, teamName: string=NOT_YET, teamDomain: string=NOT_YET, gridId: string=NOT_GRID) => {
  const team: ITeam = { teamId, teamName, gridId, teamDomain }
  return team
}

export const putTeam = async (team: ITeam) => {
  const params: DocumentClient.PutItemInput = { TableName, Item: team }
  await ddc.put(params).promise()
}
