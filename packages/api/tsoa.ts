import { generateRoutes, generateSpec } from "@tsoa/cli"
import { ExtendedSpecConfig, ExtendedRoutesConfig } from "@tsoa/cli"
import { getEnvs } from "@anonymouschat/universal/dist/helpers"

(async () => {
  const specOptions: ExtendedSpecConfig = {
    "entryFile": "src/app.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": ["src/**/*.controller.ts"],
    description: `
# typescript-serverless-tsoa Example
- https://github.com/ACupofCommit/typescript-serverless-tsoa
    `.trim(),
    basePath: '/' + getEnvs().ENV_SLS_STAGE,
    specVersion: 3,
    outputDirectory: "./src",

    securityDefinitions: {
      // https://swagger.io/docs/specification/authentication/bearer-authentication/
      // https://tsoa-community.github.io/docs/authentication.html
      bearerAuth: {
        "type": "http",
        // @ts-ignore
        scheme: "bearer",
        bearerFormat: "JWT",
      }
    },
  }

  const routeOptions: ExtendedRoutesConfig = {
    "entryFile": "src/app.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": ["src/**/*.controller.ts"],
    routesDir: "src",
    authenticationModule: './src/middlewares/auth.middleware.ts',
  }

  await generateSpec(specOptions)
  await generateRoutes(routeOptions)
})()
