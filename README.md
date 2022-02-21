# Scoby Backend API
Backend API Application

## Prerequisites

- `NodeJS` v14 latest
- `Yarn` package manager latest version
- `PostgreSQL` database server v12 or higher with db and user created
- Install Apache ActiveMQ
```bash
$ brew install activemq
$ brew services start activemq
```

## Dependencies installation

```bash
$ yarn install
```

## Environment setup

`.env.example` file consists environment variables that needed to be set up.
You can create `.env` file or set up environment variables in system.

## Run database migrations

```bash
$ yarn migrate
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn build
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
