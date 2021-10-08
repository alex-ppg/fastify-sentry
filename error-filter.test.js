'use strict'

/* eslint-disable node/no-unpublished-require */
const Fastify = require('fastify')
const tap = require('tap')
const sinon = require('sinon')
const Sentry = require('@sentry/node')
const fastifySentry = require('../index.js')

const fastify = Fastify()

const errorFilter = (error) =>  error.message === 'trace'

fastify.register(fastifySentry, {
  dsn: 'https://00000000000000000000000000000000@sentry.io/0000000',
  environment: 'test',
  tracing: true,
  errorFilter
})

tap.test('errorFilter disables sentry tracing for filtered Errors', async (test) => {
  test.teardown(() => fastify.close())
  const captureException = sinon.spy(Sentry, 'captureException')
  const warn = sinon.spy(console, 'warn')

  fastify.post('/trace', async () => {
    throw new Error('trace')
  })
  fastify.post('/no-trace', async () => {
    throw new Error('no trace')
  })
  await fastify.ready()

  // filtered Errors get logged, but not captured by Sentry
  await fastify.inject({
    method: 'POST',
    url: '/no-trace',
    payload: {}
  })

  test.equal(captureException.calledOnce, false)
  test.equal(warn.called, true)

  // unfiltered Errors get captured by Sentry
  await fastify.inject({
    method: 'POST',
    url: '/trace',
    payload: {}
  })

  test.equal(captureException.calledOnce, true)
  test.equal(warn.calledOnce, true)

  // no logging of filtered Errors in production mode
  process.env.NODE_ENV = 'production'
  await fastify.inject({
    method: 'POST',
    url: '/no-trace',
    payload: {}
  })
  test.equal(captureException.calledOnce, true)
  test.equal(warn.calledOnce, true)
})
