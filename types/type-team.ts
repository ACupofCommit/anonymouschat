import { isArray, every } from "lodash"
import { isNotNullObject, isNotEmptyString } from "../common/common-util"

export interface ITeam {
  gridId: string
  teamId: string
  teamName: string
  teamDomain: string
}

export const isTeam = (o: any): o is ITeam => {
  if (!isNotNullObject(o)) return false

  const { gridId, teamId, teamName } = o
  if (!isNotEmptyString(teamId)) return false
  if (!isNotEmptyString(teamName)) return false
  if (!isNotEmptyString(gridId)) return false

  return true
}

export const isTeamArr = (arr: any): arr is ITeam[] => {
  if (!isArray(arr)) return false
  if (!every(arr, isTeam)) return false
  return true
}
