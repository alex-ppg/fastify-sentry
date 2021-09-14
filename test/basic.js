'use strict'

/* eslint-disable node/no-unpublished-require */
const Fastify = require('fastify')
const tap = require('tap')
const fastifySentry = require('../index.js')

const fastify = Fastify()
fastify.register(fastifySentry, {
  dsn: 'https://00000000000000000000000000000000@sentry.io/0000000',
  environment: 'test'
})

tap.test('sentryConnector basic test', async (test) => {
  test.teardown(() => fastify.close())

  fastify.post('/', async () => {
    throw new Error('Basic Error')
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    payload: {}
  })

  const payload = response.json()
  test.equal(response.statusCode, 500)
  test.equal(payload.message, 'Basic Error')
})
