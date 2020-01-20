module.exports = {
  publicRuntimeConfig: {
    ANONYMOUSLACK_API_BASE_URL: process.env.ANONYMOUSLACK_API_BASE_URL,
    GIT_REVISION: process.env.GIT_REVISION || 'maybe-local-dev-server',
  },
}
