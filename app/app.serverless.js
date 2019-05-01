const serverlessHttp = require('serverless-http')

const app = require('./app')

const handler = serverlessHttp(app)

module.exports = {
  handler,
}

