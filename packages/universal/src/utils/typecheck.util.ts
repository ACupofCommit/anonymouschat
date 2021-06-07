export const isNotEmptyString = (s: any): s is string => {
  return !!(typeof s === 'string' && s)
}

export const isNotNullObject = (o: any): o is Record<string, any> => {
  return !!(typeof o === 'object' && o !== null)
}

export const isOptionalNotEmptyString = (o: any): o is string | void => {
  if (o === void 0) return true
  return isNotEmptyString(o)
}
