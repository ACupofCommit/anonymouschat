# Anonymous Chat - API package
- [Bolt](https://slack.dev/bolt-js) based slack app.
- It uses [Serverless framework](https://www.serverless.com/framework/docs/) for production deployment.

## Install dependencies

```
$ yarn
```

## Development

Logs from AWS
```
$ sam logs -n typescript-serverless-tsoa-prod-slack -t --region us-west-2
```

### Environments

```
export ENV_SLS_STAGE=local
export ENV_REVISION='your-git-revision'
```

```
$ yarn dev

# If you want use other port, (It doesn't support in Windows)
$ HTTP_PORT=3030 yarn dev
```

- Open [http://localhost:3000/local/version](http://localhost:3000/local/version) with your browser to see the result.
- Swagger docs is here [http://localhost:3000/local/docs/](http://localhost:3000/local/docs/) (Don't forget trailing slash `/`)

## Structure
```
         +---------+
         | Request |
         +----+----+
              |
+-------------+-------------+
| Middlewares / Controllers |    +----------+
|---------------------------|    | External |
|          Services         |----|  Servers |
|          Helpers          |    +----------+
|---------------------------|    +-----------+
|           Models          |----| Databases |
|---------------------------|    +-----------+
|           Types           |
|---------------------------|
|          Modules          |
|           Utils           |
|---------------------------|
|     3rd party modules     |
+---------------------------+
```

- **Middlewares** handles requests. It can use every layer but recommend to use Services.
- **Controllers** creates routers by TSOA.
- **Services** handle main business logic.
- **Helpers** Data models and types in here. It can use helpers.
- **Types** of application domain.
- **Modules** are features that can be independently driven without knowing the application domain.
  For example, async task management module.
- **Utils** small size of modules. For example, date convertor or string filter functions.
- 3rd party packages(node_modules): It can be used by every layer.
