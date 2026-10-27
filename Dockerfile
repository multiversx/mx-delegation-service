FROM node:24.22.1-alpine AS build

# nestjs-redis is installed from a git repository
RUN apk add --no-cache git

WORKDIR /app
RUN chown -R node:node /app

USER node
COPY --chown=node . /app

RUN yarn install --frozen-lockfile

# should be removed if you are using custom plugins
RUN yarn init-plugins

RUN yarn build

FROM node:24.22.1-alpine

# AssetsService runs git against dist/repos/mx-assets
RUN apk add --no-cache git

WORKDIR /app
RUN chown -R node:node /app

ENV NODE_CONFIG_DIR=/app/config

COPY --from=build --chown=node /app/*.json /app/
COPY --from=build --chown=node /app/dist /app/dist
COPY --from=build --chown=node /app/node_modules /app/node_modules
COPY --from=build --chown=node /app/apps/delegation-api/src/config/*.json /app/config/

USER node

EXPOSE 3005 4001
CMD ["node", "dist/apps/delegation-api/main"]
