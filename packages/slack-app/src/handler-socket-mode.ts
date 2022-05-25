import { App} from "@slack/bolt"
import { initialize } from "./action"

Error.stackTraceLimit = 50

const boltApp = new App({
  token: process.env.ANONYMOUSCHAT_BOT_TOKEN,
  signingSecret: process.env.ANONYMOUSCHAT_SIGNING_SECRET,
  clientId: process.env.ANONYMOUSCHAT_CLIENT_ID,
  clientSecret: process.env.ANONYMOUSCHAT_CLIENT_SECRET,
  scopes: [],
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

boltApp.start().then(() => console.log('⚡️ Socket mode Bolt app started'))
initialize(boltApp)
