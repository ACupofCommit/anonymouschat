# Anonymous Chat
Slack app to help you communicate anonymously.

## Prerequisite
- Nodejs 14.x
- Terraform
- AWS

## Install dependencies

```
$ yarn
```

## Development
It consists of some packages below.
- **slack-app**: Slack app based on [bolt-js][bolt-js].
- **api**: API server based on [TSOA](tsoa).
- **web**: Message writing web page based on [nextjs](nextjs) for complete anonymity.
- **universal**: Code that is used universally across multiple packages.

**Environments**:
```
export ENV_SLS_STAGE=local
export ENV_REVISION=local
export AWS_ACCESS_KEY_ID=key
export AWS_SECRET_ACCESS_KEY=secret
export AWS_DEFAULT_REGION=us-east-1
export DYNAMO_ENDPOINT=http://localhost:8002/
export ANONYMOUSCHAT_LOGLEVEL=debug
export ANONYMOUSCHAT_TABLENAME_PREFIX=Anonymouslack-Test
export ANONYMOUSCHAT_WEB_DAILY_URL_ENDPOINT=http://localhost:3003/w/
export ANONYMOUSCHAT_CORS_ALLOWLIST=http://localhost
export ANONYMOUSCHAT_SIGNING_SECRET=e6xxxxxxxxxxxxxxxxxxxxxxxxxxxxb6
export ANONYMOUSCHAT_BOT_TOKEN=xoxb-1000000000003-1000000000009-6xxxxxxxxxxxxxxxxxxxxxxh
export ANONYMOUSCHAT_STATE_SECRET='xxx'
export ANONYMOUSCHAT_TOKEN_REFRESH_PASSWORD='yyy'
export ANONYMOUSCHAT_CLIENT_ID=1000000000003.1000000000005
export ANONYMOUSCHAT_CLIENT_SECRET=8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1

# for socket mode
export SLACK_APP_TOKEN=xapp-1-A000000000R-1000000000005-fxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0
```

**DynamoDB on local**:
```
$ docker run -d -p8000:8000 -p8002:8002 -eAWS_REGION=$AWS_DEFAULT_REGION instructure/dynamo-local-admin
$ yarn --cwd packages/universal build
$ npx ts-node packages/slack-app/bin/create-dynamodb-table.ts
```

**Run all packages**:
```
$ npx lerna run dev --stream --parallel
```

[bolt-js]: https://slack.dev/bolt-js
[tsoa]: https://tsoa-community.github.io/docs/
[nextjs]: https://nextjs.org/
