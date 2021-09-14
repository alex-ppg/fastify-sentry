'use strict'

/* eslint-disable node/no-unpublished-require */
const Fastify = require('fastify')
const tap = require('tap')
const fastifySentry = require('../index.js')
const fastify = Fastify()

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

tap.test('sentryConnector with custom error handler', async (test) => {
  test.teardown(() => fastify.close())

  fastify.post('/', async () => {
    throw new Error('Oops')
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    payload: { error: 503, message: 'Internal Server Error' }
  })

  const payload = response.json()

  test.equal(response.statusCode, 503)
  test.equal(payload.message, 'Internal Server Error')
  test.equal(payload.e, 'Oops')
})
