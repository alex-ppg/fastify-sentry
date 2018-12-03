"use strict";

const fastify = require("fastify")();
const tap = require("tap");
const fastifySentry = require("./index");

// Custom error handler declaration
const errorHandler = (req, reply) => {
  reply.send({
    error: req.body.error,
    message: req.body.message
  });
};

tap.test("fastify sentry error handler exist", test => {
  test.plan(3);

  fastify.register(fastifySentry, {
    dsn: "https://00000000000000000000000000000000@sentry.io/0000000",
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
        payload: { error: 500, message: "Internal Server Error" }
      },
      (err, res) => {
        test.strictEqual(res.statusCode, 500);
        test.strictEqual(res.statusMessage, "Internal Server Error");
        fastify.close(() => {
          test.end();
          process.exit(0);
        });
      }
    );
  });
});
