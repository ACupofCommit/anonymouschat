# Anonymouslack

## Install dependencies

```shell
$ yarn install
```

## Run dev server

```shell
$ yarn dev
```

## Create dynamody table

```shell
$ docker run -p 8000:8000 -d amazon/dynamodb-local
$ npx babel-node --config-file ./bin/babel.config.js --extensions ".ts" -- bin/create-local-dynamodb-table.ts
```
