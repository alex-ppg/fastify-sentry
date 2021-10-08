'use strict'

/* eslint-disable node/no-unpublished-require */
const Fastify = require('fastify')
const tap = require('tap')
const fastifySentry = require('../index')

tap.test('sentryConnector fails without DSN', async (test) => {
  try {
    const fastify = Fastify()
    fastify.register(fastifySentry, {})
    await fastify.ready()
    test.fail('should not get here')
  } catch (e) {
    test.equal(e.message, 'Sentry DSN is required.')
  }
  test.end()
})
