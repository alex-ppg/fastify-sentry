'use strict'

const fp = require('fastify-plugin')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line no-unused-vars

function sentryConnector(fastify, opts, next) {
  Sentry.init(opts)
  fastify.setErrorHandler((err, req, reply) => {
    Sentry.withScope((scope) => {
      if (req && req.user && req.user.sub) {
        scope.setUser({
          id: req.user.sub,
          ip_address: req.ip
        })
      } else {
        scope.setUser({
          ip_address: req.ip
        })
      }
      scope.setTag('path', req.url)
      // will be tagged with my-tag="my value"
      Sentry.captureException(err)
      opts.errorHandler ? opts.errorHandler(err, req, reply) : reply.send(err)
    })
  })
  next()
}

module.exports = fp(sentryConnector, { name: 'fastify-sentry' })
