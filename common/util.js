
const isNotEmptyString = (s) => {
  return !!(typeof s === 'string' && s)
}

const isNotNullObject = (o) => {
  return !!(typeof o === 'object' && o !== null)
}

module.exports = {
  isNotEmptyString,
  isNotNullObject,
}