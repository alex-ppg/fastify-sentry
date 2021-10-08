'use strict'

const fp = require('fastify-plugin')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line no-unused-vars
const extractRequestData = require('./lib/extractRequestData.js')

/**
 * @param {import('fastify').fastify} fastify
 * @param {{
 *  dsn: string,
 *  tracing: boolean = false,
 *  errorHandler?: (error: Error, request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => void,
 *  errorFilter?: (error: Error, request: import('fastify').FastifyRequest) => boolean
 * }} opts
 * @param {function} next
 * @returns {void}
 */
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
    // If there is a trace header set, we extract the data from it (parentSpanId, traceId, and sampling decision)
    let traceparentData
    if (
      request.headers &&
      typeof request.headers['sentry-trace'] === 'string'
    ) {
      traceparentData = Tracing.extractTraceparentData(
        request.headers['sentry-trace']
      )
    }

    const extractedRequestData = extractRequestData(request)

    request.sentryTransaction = Sentry.startTransaction(
      {
        op: 'http.server',
        name: `${request.method} ${request.url}`,
        ...traceparentData
      },
      { request: extractedRequestData }
    )
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
    if (opts.errorFilter && ! opts.errorFilter(error, request)) {
      process.env.NODE_ENV !== 'production' && console.warn('Error not reported to Sentry', error)
    } else {
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
      })
    }

    opts.errorHandler
      ? opts.errorHandler(error, request, reply)
      : reply.send(error)

    return
  })

  next()
}

module.exports = fp(sentryConnector, { name: 'fastify-sentry' })
