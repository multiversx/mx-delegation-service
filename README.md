
## Description

Delegation API for the Elrond network


## Installation

```bash
$ yarn install
$ yarn init-plugins
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Dependencies
1. Redis Server is required to be installed [docs](https://redis.io/).

You can use `docker-compose up -d` in a terminal to use a local docker container for all these dependencies.

After running the sample, you can stop the Docker container with `docker-compose down`

It depends on the following external systems:
- gateway:
    - provides access to node information, such as network settings, delegation contract configs, staking providers settings, etc
    - docs: https://docs.elrond.com/sdk-and-tools/proxy/
- index:
    - a database that indexes data that can be queries, such as transactions, blocks, delegators, etc.
    - docs: https://docs.elrond.com/sdk-and-tools/elastic-search/

It uses on the following internal systems:
- redis: used to cache various data, for performance purposes
  
An API instance can be started with the following behavior:
- public API: provides REST API for the consumers
- private API: used to report prometheus metrics & health checks