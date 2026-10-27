FROM node:24.22.1-alpine AS build
RUN apk add --no-cache git
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn init-plugins && yarn build

FROM node:24.22.1-alpine AS deps
RUN apk add --no-cache git
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

FROM node:24.22.1-alpine
# AssetsService runs git against dist/repos/mx-assets
RUN apk add --no-cache git
WORKDIR /app
ENV NODE_CONFIG_DIR=dist/apps/delegation-api/config
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node apps/delegation-api/src/config/*.json ./dist/apps/delegation-api/config/
COPY --chown=node:node package.json ./
USER node
EXPOSE 3005 4001
CMD ["node", "dist/apps/delegation-api/main"]
