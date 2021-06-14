import { Body, Controller, Get, Post, Route } from "@tsoa/runtime"
import { InstallProvider } from '@slack/oauth'
import { getGroup, TSTError } from "@anonymouslack/universal/dist/models"
import { ResItem, ResOK } from "@anonymouslack/universal/dist/types"
import { AdminService } from "../services/admin.service"
import { getClientByGroup } from "../helpers/api.helper"
import { ANONYMOUSLACK_CLIENT_ID, ANONYMOUSLACK_CLIENT_SECRET, ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD } from "../models/envs.model"

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

  @Get('get-install-url')
  public async getInstallUrl(): Promise<ResItem<string>> {

    // initialize the installProvider
    const installer = new InstallProvider({
      clientId: ANONYMOUSLACK_CLIENT_ID,
      clientSecret: ANONYMOUSLACK_CLIENT_SECRET,
      stateSecret: 'my-state-secret'
    });

    const url = await installer.generateInstallUrl({
      scopes: ['chat:write','chat:write.customize','commands'],
    })

    return { ok: true, item: url }
  }
}
