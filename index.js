"use strict";

const fastifyPlugin = require("fastify-plugin");
const Sentry = require("@sentry/node");

async function sentryConnector(fastify, options) {
  Sentry.init({
    dsn: options.dsn,
    environment: options.environment
  });
  fastify.setErrorHandler((err, req, reply) => {
    Sentry.withScope(scope => {
      scope.setUser({
        ip_address: req.raw.ip
      });
      scope.setTag("path", req.raw.url);
      // will be tagged with my-tag="my value"
      Sentry.captureException(err);
      options.errorHandler
        ? options.errorHandler(req, reply)
        : reply.send({
            error: 500,
            message: "Internal Server Error"
          });
    });
  });
}

module.exports = fastifyPlugin(sentryConnector);
