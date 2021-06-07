# Anonymouslack
Slack app to help you communicate anonymously.

## Development
It consists of some packages below.
- **slack-app**: Slack app based on [bolt-js][bolt-js].
- **api**: API server based on [TSOA](tsoa).
- **web**: Message writing web page based on [nextjs](nextjs) for complete anonymity.
- **universal**: Code that is used universally across multiple packages.


**Environments**:
```
// TODO
```

**DynamoDB on local**:
```
$ docker run -d -p8000:8000 -p8002:8002 -eAWS_REGION=$AWS_DEFAULT_REGION instructure/dynamo-local-admin
$ npx lerna run create-dynamodb-tables --scope=slack-app --stream
```

**Run all packages**:
```
$ npx lerna run dev --stream
```

[bolt-js]: https://slack.dev/bolt-js
[tsoa]: https://tsoa-community.github.io/docs/
[nextjs]: https://nextjs.org/
