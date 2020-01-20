# hooks/build 에서 build 명령어전 docker run에서 사용하는 docker image와 일치해야함
FROM node:10.18.1-alpine

# TODO: nextjs 빌드 후 삭제해도 되는 파일들 삭제하여 image사이즈 최적화
COPY api /root/app/api
COPY bin /root/app/bin
COPY common /root/app/common
COPY types /root/app/types
COPY components /root/app/components
COPY pages /root/app/pages
COPY web /root/app/web

COPY package.json /root/app/
COPY yarn.lock /root/app/
COPY next-env.d.ts /root/app/
COPY next.config.js /root/app/
COPY babel.config.js /root/app/
COPY tsconfig.json /root/app/
COPY README.md /root/app/
COPY LICENSE /root/app/

# hooks/build 참고
COPY node_modules /root/app/node_modules
COPY .next /root/app/.next

WORKDIR /root/app

# NOTICE: yarn install 시 NODE_ENV=production 일때,
# devDependencies 설치가 안되므로 반드시 yarn install 이후에 셋팅해야함
ARG GIT_REVISION
ENV GIT_REVISION="${GIT_REVISION}"
ENV NODE_ENV="production"

# TODO: 현재 babel-node를 사용하고 있는 부분을
# node를 사용하여 실행하도록 개선 필요
CMD yarn start
