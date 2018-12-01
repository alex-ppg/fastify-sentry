"use strict";

const fastify = require("fastify")();
const tap = require("tap");
const fastifySentry = require("./index");

// This test suite recreates https://www.cockroachlabs.com/docs/stable/build-a-nodejs-app-with-cockroachdb-sequelize.html
tap.test("fastify sentry error handler exist", test => {
  test.plan(2);

  fastify.register(fastifySentry, {
    dsn: "https://00000000000000000000000000000000@sentry.io/0000000"
  });

  fastify.ready(err => {
    test.error(err);
    fastify._errorHandler(
      new Error("test"),
      {
        raw: {
          ip: "1.1.1.1",
          url: "/"
        }
      },
      {
        send: obj => {
          test.equal(obj.error, 500);
          test.equal(obj.message, "Internal Server Error");
          fastify.close(() => test.end());
        }
      }
    );
  });
});
