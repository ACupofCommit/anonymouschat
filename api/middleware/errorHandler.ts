import { Response, Request, ErrorRequestHandler, RequestHandler } from "express"
import { createLogger } from "../logger"

const logger = createLogger('errorHandler')

export const handleError: ErrorRequestHandler = (err: any, req: Request, res: Response, _) => {
  logger.debug('in errorHandler')

  const errorMessage =
    typeof err === 'string' ? err
    : err.message ? err.message
    : '[Empty Error Message]'

  logger.error(errorMessage)
  if (err && err.stack) logger.error(err.stack)

  if (res.statusCode === 200) res.status(500)

  res.json({ errorMessage, statusCode: res.statusCode, requestPath: req.path })
}

export const handle404: RequestHandler = (req: Request, res: Response) => {
  const errorMessage = 'wrong api path: ' + req.path
  res.status(404).json({ errorMessage, statusCode: res.statusCode })
}
