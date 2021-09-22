import type { AWS } from '@serverless/typescript'
import { getEnvs } from '@anonymouschat/universal/dist/helpers'

const {ANONYMOUSCHAT_BOT_TOKEN, ANONYMOUSCHAT_SIGNING_SECRET} = process.env
const {ANONYMOUSCHAT_CLIENT_ID, ANONYMOUSCHAT_CLIENT_SECRET} = process.env
const {ANONYMOUSCHAT_TABLENAME_PREFIX} = process.env
const {ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT} = process.env
const {AWS_DEFAULT_REGION} = process.env
const {ENV_SLS_STAGE} = process.env
const {ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD} = process.env
const {ANONYMOUSCHAT_STATE_SECRET} = process.env

if (!ANONYMOUSCHAT_BOT_TOKEN) throw new Error('ANONYMOUSCHAT_SIGNING_SECRET is required')
if (!ANONYMOUSCHAT_SIGNING_SECRET) throw new Error('ANONYMOUSCHAT_SIGNING_SECRET is required')
if (!ANONYMOUSCHAT_CLIENT_ID) throw new Error('ANONYMOUSCHAT_CLIENT_ID is required')
if (!ANONYMOUSCHAT_CLIENT_SECRET) throw new Error('ANONYMOUSCHAT_CLIENT_SECRET is required')
if (!ANONYMOUSCHAT_TABLENAME_PREFIX) throw new Error('ANONYMOUSCHAT_TABLENAME_PREFIX is required')
if (!ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT) throw new Error('ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT is required')
if (!ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD) throw new Error('ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD is required')
if (!ANONYMOUSCHAT_STATE_SECRET) throw new Error('ANONYMOUSCHAT_STATE_SECRET is required')
if (!ENV_SLS_STAGE) throw new Error('ENV_SLS_STAGE is required')
if (!AWS_DEFAULT_REGION) throw new Error('AWS_DEFAULT_REGION is required')

console.log('REGION: ' + AWS_DEFAULT_REGION)
const serverlessConfiguration: AWS = {
  service: 'anonymous-chat-for-slack',
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
    slack: {
      handler: 'src/handler-slack.index',
      events: [
        ...['post','get','put','delete','options'].map(method => ({
          http: {
            method, path: '/slack/{pathname+}',
          }
        })),
      ],
      environment: {
        ENV_SLS_STAGE,
        ANONYMOUSCHAT_BOT_TOKEN,
        ANONYMOUSCHAT_SIGNING_SECRET,
        ANONYMOUSCHAT_TABLENAME_PREFIX,
        ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT,
        ANONYMOUSCHAT_CLIENT_ID,
        ANONYMOUSCHAT_CLIENT_SECRET,
        ANONYMOUSCHAT_STATE_SECRET,
      }
    },
  }
}

module.exports = serverlessConfiguration
