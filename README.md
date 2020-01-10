# Fastify Sentry Plugin using the Sentry SDK

[![NPM](https://nodei.co/npm/fastify-sentry.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fastify-sentry/)

[![CircleCI](https://circleci.com/gh/alex-ppg/fastify-sentry.svg?style=svg)](https://circleci.com/gh/alex-ppg/fastify-sentry)

## Installation

```bash
npm i fastify-sentry -s
```

## Usage

```javascript
const fastify = require("fastify")();
// Should be first declaration
fastify.register(
  require("fastify-sentry"),
  {
    dsn: "https://00000000000000000000000000000000@sentry.io/0000000",
    environment: "local",
    release: process.env.VERSION || "local",
    errorHandler: (err, request, reply) => {
      // You can specify a custom behavior depending on the context of "request", generate a unique identifier etc.
      if (request.raw.url === "/") {
        reply.send({
          error: 500,
          message: 'The main path "/" didn\'t work!',
          payload: err
        });
      } else {
        reply.send({
          error: 501,
          message: "Some other path failed!",
          payload: err
        });
      }
    }
  },
  err => {
    if (err) throw err;
  }
);

fastify.get("/", async (request, reply) => {
  // Errors in async functions are automatically caught
  throw new Error("Oops");
  reply.send({ hello: "world" });
});

fastify.get("/other-path", (request, reply) => {
  // On the other hand, you need to pass the Error object to "reply.send" for it to be logged as Fastify does not catch errors in synchronous functions!
  reply.send(new Error("I did it again!"));
});
```

## Description

This plugin adds the Sentry SDK error handler by using `fastify.setErrorHandler`. This means that the Sentry SDK will only catch any errors thrown in routes with `async` functions. In order to properly log errors thrown within synchronous functions, you need to pass the error object within `reply.send`. It also adds certain metadata, namely the `path` and the `ip` parameters of `req.raw`, to both the `User` context and `Tag` context of Sentry.

## Options
| Option        | Description                                                         | Sentry Documentation                                                                    |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `dsn`         | Required, the DSN specified by Sentry.io to properly log errors to. |                                                                                         |
| `environment` | Optional, defaults to 'local'                                       | [Environments](https://docs.sentry.io/enriching-error-data/environments/?platform=node) |
| `release`     | Optional                                                            | [Releases](https://docs.sentry.io/workflow/releases/?platform=node)                     |

## Author

[Alex Papageorgiou](alex.ppg@pm.me)

## License

Licensed under [GPLv3](./LICENSE).
