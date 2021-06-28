import type { AWS } from '@serverless/typescript'
import { getEnvs } from '@anonymouslack/universal/dist/helpers'

const {ANONYMOUSLACK_BOT_TOKEN, ANONYMOUSLACK_SIGNING_SECRET} = process.env
const {ANONYMOUSLACK_CLIENT_ID, ANONYMOUSLACK_CLIENT_SECRET} = process.env
const {ANONYMOUSLACK_TABLENAME_PREFIX} = process.env
const {AWS_DEFAULT_REGION} = process.env
const {ENV_SLS_STAGE} = process.env
const {ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD} = process.env
const {ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT} = process.env
const {ANONYMOUSLACK_STATE_SECRET} = process.env
const {ANONYMOUSLACK_CORS_ALLOWLIST} = process.env
const {ENV_REVISION} = process.env

if (!ANONYMOUSLACK_BOT_TOKEN) throw new Error('ANONYMOUSLACK_SIGNING_SECRET is required')
if (!ANONYMOUSLACK_SIGNING_SECRET) throw new Error('ANONYMOUSLACK_SIGNING_SECRET is required')
if (!ANONYMOUSLACK_CLIENT_ID) throw new Error('ANONYMOUSLACK_CLIENT_ID is required')
if (!ANONYMOUSLACK_CLIENT_SECRET) throw new Error('ANONYMOUSLACK_CLIENT_SECRET is required')
if (!ANONYMOUSLACK_TABLENAME_PREFIX) throw new Error('ANONYMOUSLACK_TABLENAME_PREFIX is required')
if (!ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD) throw new Error('ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD is required')
if (!ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT) throw new Error('ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT is required')
if (!ANONYMOUSLACK_STATE_SECRET) throw new Error('ANONYMOUSLACK_STATE_SECRET is required')
if (!ANONYMOUSLACK_CORS_ALLOWLIST) throw new Error('ANONYMOUSLACK_CORS_ALLOWLIST is required')
if (!ENV_REVISION) throw new Error('ENV_REVISION is required')
if (!ENV_SLS_STAGE) throw new Error('ENV_SLS_STAGE is required')
if (!AWS_DEFAULT_REGION) throw new Error('AWS_DEFAULT_REGION is required')

console.log('REGION: ' + AWS_DEFAULT_REGION)
const serverlessConfiguration: AWS = {
  service: 'anonymouslack-api',
  frameworkVersion: '2',
  custom: {
    webpack: {
      packager: 'yarn',
      webpackConfig: './webpack.config.js',
      packagerOptions: {
        noFrozenLockfile: true,
      },
      includeModules: {
        forceExclude: ['aws-sdk'],
      },
    },
    "serverless-offline": {
      lambdaPort: process.env.HTTP_PORT
        ? Number(process.env.HTTP_PORT) + 2
        : 3002,
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-pseudo-parameters',
  ],
  // https://www.serverless.com/framework/docs/deprecations/
  variablesResolutionMode: '20210219',
  provider: {
    name: 'aws',
    stage: getEnvs().ENV_SLS_STAGE,
    // @ts-expect-error
    region: AWS_DEFAULT_REGION,
    lambdaHashingVersion: '20201221',
    runtime: 'nodejs12.x',
    apiGateway: {
      shouldStartNameWithService: true,
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      // https://www.serverless.com/framework/docs/providers/aws/guide/variables#reference-variables-in-javascript-files
      ...getEnvs(),
    },
    iam: {
      role: {
        statements: [{
          Effect: 'Allow',
          Action: [
            'dynamodb:DescribeTable',
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
          ],
          Resource: [
            "arn:aws:dynamodb:#{AWS::Region}:#{AWS::AccountId}:table/*"
          ],
        }]
      }
    },
  },
  functions: {
    api: {
      handler: 'src/handler-api.index',
      events: [
        ...['post','get','put','delete'].map(method => ({
          http: {
            method,
            path: '/api/{pathname+}',
            cors: true,
          },
        })),
      ],
      environment: {
        ENV_SLS_STAGE,
        ENV_REVISION,
        ANONYMOUSLACK_BOT_TOKEN,
        ANONYMOUSLACK_SIGNING_SECRET,
        ANONYMOUSLACK_TABLENAME_PREFIX,
        ANONYMOUSLACK_CLIENT_ID,
        ANONYMOUSLACK_CLIENT_SECRET,
        ANONYMOUSLACK_TOKEN_REFRESH_PASSWORD,
        ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT,
        ANONYMOUSLACK_STATE_SECRET,
        ANONYMOUSLACK_CORS_ALLOWLIST,
      },
    },
    batch: {
      handler: 'src/handler-batch.index',
      events: [
        {
          schedule: {
            rate: 'rate(5 minutes)'
          }
        }
      ],
      environment: {
        ENV_SLS_STAGE,
        ANONYMOUSLACK_TABLENAME_PREFIX,
        ANONYMOUSLACK_WEB_DAILY_URL_ENDPOINT,
        ANONYMOUSLACK_STATE_SECRET,
      }
    }
  }
}

module.exports = serverlessConfiguration
