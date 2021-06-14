import express from 'express'
import * as bodyParser from 'body-parser'
import * as swaggerUi from "swagger-ui-express"
import cors, { CorsOptions } from 'cors'
import { RegisterRoutes } from "./routes"
import { handle404NotFound, handleError } from './middlewares/error-handle.middleware'

const ANONYMOUSLACK_CORS_ALLOWLIST = process.env.ANONYMOUSLACK_CORS_ALLOWLIST || ''
const allowlist = ANONYMOUSLACK_CORS_ALLOWLIST.split(',')

type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: boolean) => void) => void;
const customOrigin: CustomOrigin = (origin='', callback) => {
  console.log('origin: ' + origin)
  if (!origin) return callback(null, true)
  if (/^http:\/\/localhost(:\d+?)?$/.test(origin)) return callback(null, true)
  if (/^http:\/\/127.0.0.1(:\d+?)?$/.test(origin)) return callback(null, true)

  if (allowlist.indexOf(origin) !== -1) {
    callback(null, true)
  } else {
    callback(new Error('Not allowed by CORS'))
  }
}

const corsOptions: CorsOptions = {
  origin: customOrigin,
}

const app = express()
app.options('/api',cors<express.Request>()) // enable pre-flight request
app.use('/api',cors<express.Request>(corsOptions))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

if (process.env.TST_SLS_STAGE !== 'prod') {
  const swaggerJson = require("./swagger.json")
  app.use('/api/docs', swaggerUi.serveWithOptions({redirect: false}))
  app.get('/api/docs', swaggerUi.setup(swaggerJson))
}

app.use('/api/hello', (_req,res) => res.send('world'))
RegisterRoutes(app)

app.use(handle404NotFound)
app.use(handleError)

export default app
