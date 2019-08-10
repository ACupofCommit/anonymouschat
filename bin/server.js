const url = require('url')
const next = require('next')
const express = require('express')
const routerApiSlack = require('../api/router-slack')

const port = parseInt(process.env.PORT || "3000", 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {

  const server = express()

  server.use('/api/slack', routerApiSlack)

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

