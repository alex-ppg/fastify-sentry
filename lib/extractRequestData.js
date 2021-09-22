'use strict'

const DEFAULT_REQUEST_KEYS = ['headers', 'method', 'query_string', 'url']

/**
 * Function copied from
 * https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts
 * and mofidied for Fastify
 *
 * Data (req.body) isn't available in onRequest hook,
 * as it is parsed later in the fastify lifecycle
 * https://www.fastify.io/docs/latest/Hooks/#onrequest
 */
function extractRequestData(req, keys) {
  if (!keys || keys.length <= 0 || typeof keys !== 'object') {
    keys = DEFAULT_REQUEST_KEYS
  }
  const requestData = {}
  const headers = req.headers || {}
  const method = req.method
  const host = req.hostname
  const protocol = req.protocol
  const originalUrl = req.url
  const absoluteUrl = protocol + '://' + host + originalUrl
  keys.forEach(function (key) {
    switch (key) {
      case 'headers':
        requestData.headers = headers
        break
      case 'method':
        requestData.method = method
        break
      case 'url':
        requestData.url = absoluteUrl
        break
      case 'query_string':
        requestData.query_string = Object.assign({}, req.query)
        break
      default:
        if ({}.hasOwnProperty.call(req, key)) {
          requestData[key] = req[key]
        }
    }
  })
  return requestData
}

module.exports = exports = extractRequestData
