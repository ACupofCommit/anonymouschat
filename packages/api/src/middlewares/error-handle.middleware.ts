import { statusCodes, TSTError } from "@anonymouslack/universal/dist/models"
import { ValidateError } from "@tsoa/runtime"
import { ErrorRequestHandler, RequestHandler } from "express"

export const handleError: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ValidateError) {
    console.log(`Caught ValidationError for ${req.path}:`, err.fields)
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    })
  }

  if (err instanceof TSTError) {
    const {code, message, detail} = err
    console.log(`Caught TSTError. code: ${code}, message: ${message}, detail: ${JSON.stringify(detail)}`)
    return res.status(statusCodes[code]).json({ code, message })
  }

  if (err instanceof Error) {
    console.error(err.message)
    console.error(err.stack)
    return res.status(500).json({ message: err.message })
  }

  res.status(500).json({ message: 'Unknown Server error' })
}

export const handle404NotFound: RequestHandler = (req, res) => {
  res.status(404).send('Hello! Not found ' + req.path)
}
