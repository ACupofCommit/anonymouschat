import url from 'url'
import next from 'next'
import express from 'express'
import routerApiWeb from '../api/router-api-web'
import routerSlackAction from '../api/router-slack-action'
import routerSlackCommand from '../api/router-slack-command'
import routerSlackOauth from '../api/router-slack-oauth'

const port = parseInt(process.env.PORT || "3000", 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {

  const server = express()

  server.use('/api/slack/action', routerSlackAction)
  server.use('/api/slack/command', routerSlackCommand)
  server.use('/api/slack/oauth', routerSlackOauth)
  server.use('/api/web', routerApiWeb)

  server.use('/', (req, res) => {
    const parsedUrl = url.parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.info(`ASK: ${process.env.ASK_GIT_REVISION}`)
    console.info(`> Ready on http://localhost:${port}`)
  })
})

