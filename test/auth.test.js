'use strict'

/* eslint-disable node/no-unpublished-require */
const Fastify = require('fastify')
const tap = require('tap')
const fastifySentry = require('../index')

const fastify = Fastify()
fastify.register(require('fastify-jwt'), { secret: 'supersecret' })
fastify.register(fastifySentry, {
  dsn: 'https://00000000000000000000000000000000@sentry.io/0000000',
  environment: 'test'
})

fastify.addHook('onRequest', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

tap.test('sentryConnector with userId', async (test) => {
  test.teardown(() => fastify.close())

  fastify.post('/', async () => {
    throw new Error('Oops')
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.zbgd5BNF1cqQ_prCEqIvBTjSxMS8bDLnJAE_wE-0Cxg'
    },
    payload: {}
  })

  const payload = response.json()
  test.equal(response.statusCode, 500)
  test.equal(payload.message, 'Oops')
})
