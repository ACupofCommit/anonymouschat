import { App, ExpressReceiver } from '@slack/bolt'
import serverlessExpress from '@vendia/serverless-express'
import { initialize } from './action'

const ANONYMOUSLACK_SIGNING_SECRET = process.env.ANONYMOUSLACK_SIGNING_SECRET
if (!ANONYMOUSLACK_SIGNING_SECRET) throw new Error('ANONYMOUSLACK_SIGNING_SECRET is required')

// Initialize your custom receiver
export const expressReceiver = new ExpressReceiver({
  signingSecret: ANONYMOUSLACK_SIGNING_SECRET,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true
})

const boltApp = new App({
  token: process.env.ANONYMOUSLACK_BOT_TOKEN,
  signingSecret: process.env.ANONYMOUSLACK_SIGNING_SECRET,
  receiver: expressReceiver,
})

initialize(boltApp)

// Handle the Lambda function event
export const index = serverlessExpress({
  app: expressReceiver.app
});
