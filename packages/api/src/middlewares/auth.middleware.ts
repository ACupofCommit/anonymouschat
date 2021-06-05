import { TSTError } from "@anonymouslack/universal/dist/models"
import { Request as ExRequest } from "express"

interface User {
  userId: string
}

export async function expressAuthentication(
  req: ExRequest,
  securityName: string,
  scopes: string[]=[],
): Promise<User> {
  if (securityName !== "bearerAuth") {
    throw new TSTError('UNKNOWN_SERVER_ERROR', 'Unknown securityName in ' + req.path)
  }

  return {userId: 'xxx' }
}
