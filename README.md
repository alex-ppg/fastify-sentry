# Fastify Sentry Plugin using the Sentry SDK

[![Test](https://github.com/zentered/fastify-sentry/actions/workflows/test.yml/badge.svg)](https://github.com/zentered/fastify-sentry/actions/workflows/test.yml)
[![Semantic Release](https://github.com/zentered/fastify-sentry/actions/workflows/publish.yml/badge.svg)](https://github.com/zentered/fastify-sentry/actions/workflows/publish.yml)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## Installation

```bash
npm i @zentered/fastify-sentry -s

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

fastify.register(fastifySentry, {
  dsn: 'https://00000000000000000000000000000000@sentry.io/0000000',
  environment: 'test',
  errorHandler: errorHandler
})

fastify.get('/', async (request, reply) => {
  // Errors in async functions are automatically caught
  throw new Error('Oops')
})

fastify.get('/other-path', (request, reply) => {
  // On the other hand, you need to pass the Error object to "reply.send" for it to be logged as Fastify does not catch errors in synchronous functions!
  reply.send(new Error('I did it again!'))
})
```

## Description

This plugin adds the Sentry SDK error handler by using `fastify.setErrorHandler`. This means that the Sentry SDK will only catch any errors thrown in routes with `async` functions. In order to properly log errors thrown within synchronous functions, you need to pass the error object within `reply.send`. It also adds certain metadata, namely the `path` and the `ip` parameters of `req.raw`, to both the `User` context and `Tag` context of Sentry. If you use jwt authentication, the user id is also added to Sentry.

## Options

| Option | Description                                                         |
| ------ | ------------------------------------------------------------------- |
| `dsn`  | Required, the DSN specified by Sentry.io to properly log errors to. |

You can find further options in the [Node.js Guide on Sentry.io](https://docs.sentry.io/platforms/node/)

## Author

[Alex Papageorgiou](alex.ppg@pm.me)

## License

Licensed under [GPLv3](./LICENSE).
