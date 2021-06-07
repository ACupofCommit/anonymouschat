import { Body, Controller, Post, Route } from "@tsoa/runtime"
import { getGroup, TSTError } from "@anonymouslack/universal/dist/models"
import { ResOK } from "@anonymouslack/universal/dist/types"
import { AdminService } from "../services/admin.service"
import { getClientByGroup } from "../helpers/api.helper"

const ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD = process.env.ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD

type ReqBody = {
  password: string
  channelId: string
}

@Route("/api/admin")
export class APIAdminController extends Controller {
  @Post('refresh-daily-web-token-for-group')
  public async refreshDailyWebTokenForGroup(
    @Body() body: ReqBody
  ): Promise<ResOK> {
    const { password, channelId } = body
    if (!ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD) {
      throw new TSTError('UNKNOWN_SERVER_ERROR', 'Token refresh password is unset')
    }

    if (password !== ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD) {
      throw new TSTError('AUTH_REQUIRE', 'check your ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD')
    }

    const service = new AdminService()
    const group = await getGroup(channelId)
    const client = await getClientByGroup(group)
    await service.updateAndShareWebAccessToken(client, channelId)

    return { ok: true }
  }
}
