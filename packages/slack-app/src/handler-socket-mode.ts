import { App} from "@slack/bolt"
import { initialize } from "./action"

const boltApp = new App({
  token: process.env.ANONYMOUSLACK_BOT_TOKEN,
  signingSecret: process.env.ANONYMOUSLACK_SIGNING_SECRET,
  clientId: process.env.ANONYMOUSLACK_CLIENT_ID,
  clientSecret: process.env.ANONYMOUSLACK_CLIENT_SECRET,
  scopes: [],
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

boltApp.start().then(() => console.log('⚡️ Bolt app started'))
initialize(boltApp)
