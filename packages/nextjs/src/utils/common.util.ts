import gp from 'generate-password'
import { IFaceImoji } from '../types/type-common'

export const isNotEmptyString = (s: any): s is string => {
  return !!(typeof s === 'string' && s)
}

export const isNotNullObject = (o: any) => {
  return !!(typeof o === 'object' && o !== null)
}

export const getRawPassword = () => gp.generate({ length: 16, numbers: true })

export const getMSFromHours = (h: number) => {
  const ms = h * 60 * 60 * 1000
  if (isNaN(h)) throw new Error('ms is NaN')

  return ms
}
