FROM node:24.22.1-alpine AS build

# nestjs-redis is installed from a git repository
RUN apk add --no-cache git

WORKDIR /app
RUN chown -R node:node /app

USER node
COPY --chown=node . /app

RUN yarn install --frozen-lockfile

RUN [ -f apps/delegation-api/src/plugins/plugin.module.ts ] || yarn init-plugins:nix

RUN yarn build

FROM node:24.22.1-alpine

# AssetsService runs git against dist/repos/mx-assets
RUN apk add --no-cache git

WORKDIR /app
RUN chown -R node:node /app

COPY --from=build --chown=node /app/*.json /app/
COPY --from=build --chown=node /app/dist /app/dist
COPY --from=build --chown=node /app/node_modules /app/node_modules
COPY --from=build --chown=node /app/apps/delegation-api/src/config/*.json /app/config/
COPY --from=build --chown=node /app/apps/delegation-api/src/plugins /app/apps/delegation-api/src/plugins

USER node

EXPOSE 3005 4001
CMD ["node", "dist/apps/delegation-api/main.js"]
