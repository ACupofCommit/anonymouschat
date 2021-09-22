import { Body, Controller, Get, Post, Route } from "@tsoa/runtime"
import { InstallProvider } from '@slack/oauth'
import { botTokenScopes, getGroup, TSTError } from "@anonymouschat/universal/dist/models"
import { ResItem, ResOK } from "@anonymouschat/universal/dist/types"
import { AdminService } from "../services/admin.service"
import { getClientByGroup } from "../helpers/api.helper"
import { ANONYMOUSCHAT_CLIENT_ID, ANONYMOUSCHAT_CLIENT_SECRET, ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD, ANONYMOUSCHAT_STATE_SECRET } from "../models/envs.model"

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
    if (!ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD) {
      throw new TSTError('UNKNOWN_SERVER_ERROR', 'Token refresh password is unset')
    }

    if (password !== ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD) {
      throw new TSTError('AUTH_REQUIRE', 'check your ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD')
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
      clientId: ANONYMOUSCHAT_CLIENT_ID,
      clientSecret: ANONYMOUSCHAT_CLIENT_SECRET,
      stateSecret: ANONYMOUSCHAT_STATE_SECRET,
    });

    const url = await installer.generateInstallUrl({
      scopes: botTokenScopes,
    })

    return { ok: true, item: url }
  }
}
