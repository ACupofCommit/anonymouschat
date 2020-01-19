# Anonymouslack

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aluc-io/anonymouslack/tsc-build)
![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/alucio/anonymouslack)
![Docker Pulls](https://img.shields.io/docker/pulls/alucio/anonymouslack)

Share your mind anonymously on Slack.

## 1. Set your environment variables

```
export AWS_ACCESS_KEY_ID=AKXXXXXXXXXXXXXXXXGQ                    # For AWS dynamodb
export AWS_SECRET_ACCESS_KEY=+IxxxxxxxxxxxxxxxxxxK5              # For AWS dynamodb
export AWS_DEFAULT_REGION=us-west-1                              # For AWS dynamodb
export AWS_REGION=$AWS_DEFAULT_REGION                            # Only for local dynamodb
export DYNAMO_ENDPOINT=http://localhost:8000/                    # Only for local dynamodb

export ANONYMOUSLACK_WEB_ENDPOINT=http://localhost:3000/         # Or use your production url
export ANONYMOUSLACK_API_BASE_URL=http://localhost:3000/api/web  # Or use your production url
export ANONYMOUSLACK_CLIENT_ID=5100000000000000000000003         # From Basic Information
export ANONYMOUSLACK_CLIENT_SECRET=9b...x0i                      # From Basic Information
export ANONYMOUSLACK_SHARABLE_URL='https://....'                 # From Manage Distribution
export ANONYMOUSLACK_MANAGER_SLACK_ID='WXXXXXXX0'                # From Your Slack Profile
export ANONYMOUSLACK_TABLENAME_PREFIX=Anonymouslack-test         # Dynamodb table name prefix
export ANONYMOUSLACK_ENV=test                                    # 'production' or others
export ANONYMOUSLACK_SLASH_COMMAND=/anonymouslack-test           # Slack slash command you want
export ANONYMOUSLACK_APP_NAME=Anonymouslack-test                 # Slack app name you want
export ANONYMOUSLACK_REDIRECT_HTTP_TO_HTTPS=false                # if true, http request is redirected to https
export ANONYMOUSLACK_LOGLEVEL=debug                              # loglevel
```

## 2. Development

### Install dependencies

```shell
$ yarn install
```

### Create dynamodb table in local

```shell
$ docker run -p 8000:8000 -d amazon/dynamodb-local
$ npx babel-node --config-file ./bin/babel.config.js --extensions ".ts" -- bin/create-local-dynamodb-table.ts
## When you use the dynamodb-local, you may want dynamodb-admin the dynamodb Web GUI.
$ npx dynamodb-admin
```

### Run dev server

```shell
$ yarn dev
```

Open the http://localhost:3000 in your browser,
check the `Anonymouslack server in on!!` message.

## 3. Setting Slack App.
To integration test with Slack, **create your new slack app**
by clicking `Create New App` button in [official Slack API site](https://api.slack.com/apps)
and then follow below guides.

### Run ngrok to receive requests from Slack

```shell
$ ngrok http 3000
```

[ngrok](https://ngrok.com/) is secure introspectable tunnels to localhost webhook
development tool and debugging tool.

### `Basic Information`
- App name: `<value of 'ANONYMOUSLACK_APP_NAME'>`
- Short description: `<Slack App description you want>`

### `Interactive Components`

- Interactivity: `On`
    - Request URL: `{endpoint-url}/api/slack/action`

- Actions:
    - Click `Create New Action` button and fill out the form below
    - Action Name: Reply
    - Short Description: Reply anonymously
    - Callback ID: `ACTION_ON_MORE_OPEN_VIEW_REPLY`

### `Slack Commands`
- Click `Create New Command` button and fill out the form below
    - Command: `<value of 'ANONYMOUSLACK_SLASH_COMMAND'>`
    - Request URL: `{endpoint-url}/api/slack/command`
    - Short Description: `Post message anonymously`

### `OAuth & Permissions`
- Redirect URLs: `{endpoint-url}/api/slack/oauth`
- Add belows by `Add an OAuth Scope` button:
    - `chat:write:bot`: To use chat.postMessage, chat.postEphemeral API
    - `commands`: To add slash commands and add actions to messages
    - `channels:write`, `groups:write`,`im:write`,`mpim:write`: To check access_token is available on specific channel

## 4. License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present aluc.io
