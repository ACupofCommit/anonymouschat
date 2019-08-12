
export const isNotEmptyString = (s) => {
  return !!(typeof s === 'string' && s)
}

export const isNotNullObject = (o) => {
  return !!(typeof o === 'object' && o !== null)
}