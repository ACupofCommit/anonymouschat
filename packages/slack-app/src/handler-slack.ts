import { botTokenScopes, getToken, setToken } from '@anonymouschat/universal/dist/models'
import { isInstallationV2, KeyType } from '@anonymouschat/universal/dist/types'
import { App, ExpressReceiver } from '@slack/bolt'
import serverlessExpress from '@vendia/serverless-express'
import { initialize } from './action'

const ANONYMOUSCHAT_SIGNING_SECRET = process.env.ANONYMOUSCHAT_SIGNING_SECRET
const ANONYMOUSCHAT_CLIENT_ID = process.env.ANONYMOUSCHAT_CLIENT_ID
const ANONYMOUSCHAT_CLIENT_SECRET = process.env.ANONYMOUSCHAT_CLIENT_SECRET
const ANONYMOUSCHAT_STATE_SECRET = process.env.ANONYMOUSCHAT_STATE_SECRET

if (!ANONYMOUSCHAT_SIGNING_SECRET) throw new Error('ANONYMOUSCHAT_SIGNING_SECRET is required')
if (!ANONYMOUSCHAT_CLIENT_ID) throw new Error('ANONYMOUSCHAT_CLIENT_ID is required')
if (!ANONYMOUSCHAT_CLIENT_SECRET) throw new Error('SLACK_CLIENT_SECRET is required')
if (!ANONYMOUSCHAT_STATE_SECRET) throw new Error('ANONYMOUSCHAT_STATE_SECRET is required')

// Initialize your custom receiver
export const expressReceiver = new ExpressReceiver({
  signingSecret: ANONYMOUSCHAT_SIGNING_SECRET,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true,

  clientId: ANONYMOUSCHAT_CLIENT_ID,
  clientSecret: ANONYMOUSCHAT_CLIENT_SECRET,
  stateSecret: ANONYMOUSCHAT_STATE_SECRET,
  scopes: botTokenScopes,
  installerOptions: {
    callbackOptions: {
      success: (installation, _options, _req, res) => {
        const htmlResponse = `
<html>
  <body>
    <h2>Success! The installation(or installation request) of <b>Anonymous Chat</b> in the your ${installation.team?.name} workspace is complete.</h2>
    <h3>Please refer to <a href="https://anonymouschat.commit2.app/#/?id=usage">the Guide page</a> to use the app.</h3>
  </body>
</html>
`.trim()
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlResponse);
      }
    }
  },

  installationStore: {
    storeInstallation: async (installation) => {
      console.log('New installation!!')
      const {isEnterpriseInstall, enterprise, team} = installation
      const key = isEnterpriseInstall ? enterprise?.id : team?.id
      const keyType: KeyType = isEnterpriseInstall ? 'enterprise' : 'team'
      if (!key) throw new Error(`No key when isEnterpriseInstall: ${isEnterpriseInstall}`)
      console.log('key: ' + key)

      if (!isInstallationV2(installation)) throw new Error('installation is not v2')

      await setToken(key, keyType, installation)
    },
    fetchInstallation: async (installQuery) => {
      console.log('called fetchInstallation()')
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId) {
        const installation = await getToken(installQuery.enterpriseId)
        if (!installation) throw new Error('No installation by enterpriseId')
        return installation
      }

      if (!installQuery.teamId) throw new Error('No installQuery.teamId')

      const installation = await getToken(installQuery.teamId)
      if (!installation) throw new Error('No installation by teamId')
      return installation
    },
  },
})

const boltApp = new App({
  receiver: expressReceiver,
})

initialize(boltApp)

// Handle the Lambda function event
export const index = serverlessExpress({
  app: expressReceiver.app
});
