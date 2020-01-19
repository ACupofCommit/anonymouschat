# Anonymouslack

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aluc-io/anonymouslack/tsc-build)
![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/alucio/anonymouslack)
![Docker Pulls](https://img.shields.io/docker/pulls/alucio/anonymouslack)

Share your mind anonymously on Slack.

## Install dependencies

```shell
$ yarn install
```

## Set your environment variables

```
export AWS_ACCESS_KEY_ID=AKXXXXXXXXXXXXXXXXGQ
export AWS_SECRET_ACCESS_KEY=+IxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxK5
export AWS_DEFAULT_REGION=ap-northeast-2
export AWS_REGION=$AWS_DEFAULT_REGION           # for dynamodb-admin
export DYNAMO_ENDPOINT=http://localhost:8000/

export ANONYMOUSLACK_WEB_ENDPOINT=http://localhost:3000/         # Or use your production url
export ANONYMOUSLACK_API_BASE_URL=http://localhost:3000/api/web  # Or use your production url
export ANONYMOUSLACK_CLIENT_ID=5100000000000000000000003         # From Basic Information
export ANONYMOUSLACK_CLIENT_SECRET=9b...x0i                      # From Basic Information
export ANONYMOUSLACK_SHARABLE_URL='https://....'                 # From Manage Distribution
export ANONYMOUSLACK_MANAGER_SLACK_ID='WXXXXXXX0'                # From Your Slack Profile

export ANONYMOUSLACK_TABLENAME_PREFIX=Anonymouslack              # Dynamodb table name prefix
export ANONYMOUSLACK_ENV=test                                    # 'production' or others
export ANONYMOUSLACK_LOGLEVEL=debug
```

## Create dynamody table

```shell
$ docker run -p 8000:8000 -d amazon/dynamodb-local
$ npx babel-node --config-file ./bin/babel.config.js --extensions ".ts" -- bin/create-local-dynamodb-table.ts
$ npx dynamodb-admin
```

## Run ngrok to receive requests from Slack

```shell
$ ngrok http 3000
```

[ngrok](https://ngrok.com/) is secure introspectable tunnels to localhost webhook
development tool and debugging tool.

## Run dev server

```shell
$ yarn dev
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present aluc.io
