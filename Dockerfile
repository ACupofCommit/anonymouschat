FROM node:10.18.1-alpine

COPY api /root/app/api
COPY bin /root/app/bin
COPY common /root/app/common
COPY types /root/app/types

# nextjs 빌드 후 삭제해도 되나?
COPY components /root/app/components
COPY pages /root/app/pages
COPY web /root/app/web

COPY package.json /root/app/
COPY yarn.lock /root/app/
COPY next-env.d.ts /root/app/
COPY next.config.js /root/app/
COPY babel.config.js /root/app/
COPY tsconfig.json /root/app/
COPY README.md /root/app
COPY LICENSE /root/app

ENV GIT_REVISION="${GIT_REVISION}"

WORKDIR /root/app

RUN yarn install && yarn build

CMD yarn start
