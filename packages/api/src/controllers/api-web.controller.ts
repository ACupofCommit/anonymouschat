import { Body, Controller, Get, Post, Route} from "@tsoa/runtime"
import to from "await-to-js"
import { getGroupByWebAccessToken, getGroupId, isWebTokenValid, NOT_YET, TSTError, } from "@anonymouschat/universal/dist/models"
import { IParamNewReply, IParamNewReplyFromWeb, IParamNewVoice, IParamNewVoiceFromWeb, isGroup, isParamNewReplyFromWeb, isParamNewVoiceFromWeb, ResOK } from "@anonymouschat/universal/dist/types"
import { postAndPutReply, postAndPutSlackVoice } from "@anonymouschat/universal/dist/core"
import { checkAndConvertUrlTsToDotTs, isDotTs, isPTs } from "@anonymouschat/universal/dist/utils"
import { getClientByGroup } from "../helpers/api.helper"

type ReqCreateVoice = {
  webAccessToken: string
  paramNewVoiceFromWeb: IParamNewVoiceFromWeb
}

type ReqCreateReply = {
  webAccessToken: string
  paramNewReplyFromWeb: IParamNewReplyFromWeb
}

@Route("/api/web")
export class APIWebController extends Controller {
  @Post('voice')
  public async createVoice(
    @Body() body: ReqCreateVoice,
  ): Promise<ResOK> {
    const { webAccessToken, paramNewVoiceFromWeb } = body
    if (!isParamNewVoiceFromWeb(paramNewVoiceFromWeb)) {
      throw new TSTError('REQUEST_VALIDATION_FAILED', 'Invalid parameter')
    }

    const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
    if (err || !isGroup(group)) {
      throw new TSTError('REQUEST_VALIDATION_FAILED', 'group is not IGroup')
    }

    if (!isWebTokenValid(webAccessToken, group.webAccessTokenExpirationTime)) {
      throw new TSTError('AUTH_REQUIRE', 'EXPIRED_WEB_ACCEESS_TOKEN')
    }

    const groupId = getGroupId(group.channelId, group.teamId, group.gridId)

    const client = await getClientByGroup(group)
    const param: IParamNewVoice = { ...paramNewVoiceFromWeb, groupId, platformId: NOT_YET }
    const [err2] = await to(postAndPutSlackVoice(client, param))
    if ((err2 || {}).message === 'VOICE_LIMIT_RECENT24H') {
      throw new TSTError('REQUEST_VALIDATION_FAILED', 'VOICE_LIMIT_RECENT24H')
    }

    if (err2) throw err2

    return { ok: true }
  }

  @Post('reply')
  public async createReply(
    @Body() body: ReqCreateReply,
  ): Promise<ResOK> {
    const { webAccessToken, paramNewReplyFromWeb } = body
    if (!isParamNewReplyFromWeb(paramNewReplyFromWeb)) {
      throw new TSTError('REQUEST_VALIDATION_FAILED', 'Invalid parameter')
    }

    const [err,group] = await to(getGroupByWebAccessToken(webAccessToken))
    if (err || !isGroup(group)) {
      throw new TSTError('REQUEST_VALIDATION_FAILED', 'group is not IGroup')
    }

    if (!isWebTokenValid(webAccessToken, group.webAccessTokenExpirationTime)) {
      throw new TSTError('AUTH_REQUIRE', 'INVALID_WEB_ACCEESS_TOKEN')
    }

    const threadTs = paramNewReplyFromWeb.threadTs.trim()

    if (!isPTs(threadTs) && !isDotTs(threadTs)) {
      throw new TSTError('REQUEST_VALIDATION_FAILED', 'Wrong ts')
    }

    const dotTs = isPTs(threadTs) ? checkAndConvertUrlTsToDotTs(threadTs) : threadTs
    const groupId = getGroupId(group.channelId, group.teamId, group.gridId)
    const client = await getClientByGroup(group)
    const param: IParamNewReply = { ...paramNewReplyFromWeb, platformId: NOT_YET, groupId, threadTs: dotTs }
    await postAndPutReply(client, param)

    return { ok: true }
  }

  @Get('groups/byWebAccessToken')
  public async getGroupByWebAccessToken(): Promise<ResOK> {
    return { ok: true }
  }
}
