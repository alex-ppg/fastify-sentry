'use strict'

/* eslint-disable node/no-unpublished-require */
const tap = require('tap')
const fn = require('../lib/extractRequestData')

tap.test('extractedRequestData should process fastify request', (test) => {
  test.plan(1)
  const request = {
    headers: {
      host: 'localhost:3000',
      accept: '/*/'
    },
    hostname: 'localhost:3000',
    protocol: 'http',
    method: 'GET',
    url: '/testing'
  }

  const expected = {
    headers: { host: 'localhost:3000', accept: '/*/' },
    method: 'GET',
    query_string: {},
    url: 'http://localhost:3000/testing'
  }

  const actual = fn(request)
  test.strictSame(actual, expected)
})

tap.test('extractedRequestData should process other keys', (test) => {
  test.plan(2)
  const request = {
    testing: 'testing'
  }

  const actual = fn(request, ['testing', 'testing2'])
  test.equal(actual.testing, 'testing')
  test.equal(actual.testing2, undefined)
})
