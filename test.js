"use strict";

const fastify = require("fastify")();
const tap = require("tap");
const fastifySentry = require("./index");

// Custom error handler declaration
const errorHandler = (err, req, reply) => {
  reply.status(req.body.error).send({
    message: req.body.message,
    e: err.message
  });
};

tap.test("fastify sentry error handler exist", test => {
  test.plan(4);

  fastify.register(fastifySentry, {
    dsn: "https://00000000000000000000000000000000@sentry.io/0000000",
    environment: "test",
    errorHandler: errorHandler
  });

  fastify.post("/", async (request, reply) => {
    throw new Error("Oops");
  });

  fastify.ready(err => {
    test.error(err);
    fastify.inject(
      {
        method: "POST",
        url: "/",
        payload: { error: 503, message: "Internal Server Error" }
      },
      (err, { statusCode, payload }) => {
        payload = JSON.parse(payload);
        test.strictEqual(statusCode, 503);
        test.strictEqual(payload.message, "Internal Server Error");
        test.strictEqual(payload.e, "Oops");
        fastify.close(() => {
          test.end();
          process.exit(0);
        });
      }
    );
  });
});
