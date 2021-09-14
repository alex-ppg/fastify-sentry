# Fastify Sentry Plugin using the Sentry SDK

[![Test](https://github.com/zentered/fastify-sentry/actions/workflows/test.yml/badge.svg)](https://github.com/zentered/fastify-sentry/actions/workflows/test.yml)
[![Semantic Release](https://github.com/zentered/fastify-sentry/actions/workflows/publish.yml/badge.svg)](https://github.com/zentered/fastify-sentry/actions/workflows/publish.yml)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## Installation

```bash
npm i @zentered/fastify-sentry

or

yarn add @zentered/fastify-sentry
```

## Usage

```js
const fastifySentry = require('@zentered/fastify-sentry')

const errorHandler = (err, req, reply) => {
  reply.status(req.body.error).send({
    message: req.body.message,
    e: err.message
  })
}

app.register(fastifySentry, {
  dsn: process.env.SENTRY_DSN,
  environment: 'development',
  tracing: true,
  tracesSampleRate: 1.0
})

fastify.get('/', async (request, reply) => {
  // Errors in async functions are automatically caught
  throw new Error('Oops')
})
```

## Description

This plugin adds the Sentry SDK error handler by using `setErrorHandler`. It also adds certain metadata, namely the `path` and the `ip` parameters of the request, to both the `User` context and `Tag` context of Sentry. If you use jwt authentication, the user id is also added to Sentry.

## Options

| Option    | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| `dsn`     | Required, the DSN specified by Sentry.io to properly log errors to. |
| `tracing` | Default `false`, enable Sentry tracing.                             |

You can find further options in the [Node.js Guide on Sentry.io](https://docs.sentry.io/platforms/node/)

## Author

[Alex Papageorgiou](alex.ppg@pm.me)

## License

Licensed under [GPLv3](./LICENSE).
