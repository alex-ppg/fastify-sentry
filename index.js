'use strict'

const fp = require('fastify-plugin')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line no-unused-vars

function sentryConnector(fastify, opts, next) {
  if (!opts || !opts.dsn) {
    return next(new Error('Sentry DSN is required.'))
  }

  if (opts.tracing === true) {
    opts.integrations = [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({
        fastify
      })
    ]
  }

  Sentry.init(opts)

  fastify.decorateRequest('sentryTransaction', null)
  fastify.addHook('onRequest', async (request) => {
    request.sentryTransaction = Sentry.startTransaction({
      op: 'request',
      name: `${request.method} ${request.url}`
    })
    return
  })

  fastify.addHook('onResponse', async (request, reply) => {
    setImmediate(() => {
      const transaction = request.sentryTransaction
      transaction.setData('url', request.url)
      transaction.setData('query', request.query)
      transaction.setHttpStatus(reply.statusCode)
      transaction.finish()
    })
    return
  })

  fastify.setErrorHandler((error, request, reply) => {
    Sentry.withScope((scope) => {
      if (request && request.user && request.user.sub) {
        scope.setUser({
          id: request.user.sub,
          ip_address: request.ip
        })
      } else {
        scope.setUser({
          ip_address: request.ip
        })
      }
      scope.setTag('path', request.url)
      // will be tagged with my-tag="my value"
      Sentry.captureException(error)
      opts.errorHandler
        ? opts.errorHandler(error, request, reply)
        : reply.send(error)
    })
    return
  })

  next()
}

module.exports = fp(sentryConnector, { name: 'fastify-sentry' })
