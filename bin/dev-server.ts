import url from 'url'
import next from 'next'
import express from 'express'
import morgan from 'morgan'
import urlJoin from 'url-join'
import routerApiWeb from '../api/router-api-web'
import routerSlackAction from '../api/router-slack-action'
import routerSlackCommand from '../api/router-slack-command'
import routerSlackOauth from '../api/router-slack-oauth'

const port = parseInt(process.env.PORT || "3000", 10) || 3000
const app = next({ dev: true })
const handle = app.getRequestHandler()

const handleByNextJs = (req,res) => {
  const parsedUrl = url.parse(req.url, true)
  handle(req, res, parsedUrl)
}

app.prepare().then(() => {
  const server = express()

  server.use(morgan('combined'))
  server.use('/health', (_, res) => res.send({ ok: true }))

  server.use((req, res, next) => {
    if (process.env.ANONYMOUSLACK_REDIRECT_HTTP_TO_HTTPS !== 'true') return next()
    if (req.headers["x-forwarded-proto"] === 'https') return next()
    res.redirect(urlJoin('https:', req.headers.host, req.originalUrl))
  })

  server.use('/api/slack/action', routerSlackAction)
  server.use('/api/slack/command', routerSlackCommand)
  server.use('/api/slack/oauth', routerSlackOauth)
  server.use('/api/web', routerApiWeb)
  server.use('/', handleByNextJs)

  server.listen(port, (err) => {
    if (err) throw err
    console.info(`NODE_ENV: ${process.env.NODE_ENV}`)
    console.info(`GIT_REVISION: ${process.env.GIT_REVISION}`)
    console.info(`> Ready on port:${port}`)
  })
})

