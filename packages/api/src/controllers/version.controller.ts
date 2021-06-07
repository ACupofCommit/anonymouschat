import { Body, Controller, Get, Path, Post, Query, Route } from "@tsoa/runtime"
import { Version, VersionService } from "../services/version.service"

interface BodyParam {
  /**
   * @pattern ^[a-zA-Z]+$
   */
  name: string
  email: string
}

@Route("/api/version")
export class VersionController extends Controller {
  @Get("/")
  public async getVersion(): Promise<Version> {
    return new VersionService().get()
  }

  @Post("/echo/{pathParam}")
  public async echo(
    @Path() pathParam: string,
    @Query() search: string,
    @Body() body: BodyParam,
  ): Promise<{body: BodyParam, search: string, pathParam: string}> {
    return { body, search, pathParam }
  }
}
