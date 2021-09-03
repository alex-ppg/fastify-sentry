"use strict";

const fastifyPlugin = require("fastify-plugin");
const Sentry = require("@sentry/node");

function sentryConnector(fastify, options, done) {
  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ? options.environment : "local"
  });
  fastify.setErrorHandler((err, req, reply) => {
    Sentry.withScope(scope => {
      scope.setUser({
        ip_address: req.ip
      });
      scope.setTag("path", req.raw.url);
      // will be tagged with my-tag="my value"
      Sentry.captureException(err);
      options.errorHandler
        ? options.errorHandler(err, req, reply)
        : reply.send({
            error: 500,
            message: "Internal Server Error"
          });
    });
  });
  done();
}

module.exports = fastifyPlugin(sentryConnector);
