# Express on FaaS / Serverless Express

AWS Lambda invokes Lambda functions via a handler object.

A handler represents the name of the Lambda function and serves as the entry point that AWS Lambda uses to execute the function code.

AWS Lambda functions are triggered by AWS Events in Context, having access to each, and handle the AWS Events like so:

```
// success
module.exports.handler = function(event, context, callback) {
    callback(null, "some message");
}

// error
module.exports.handler = function(event, context, callback) {
    callback("some error");
}
```

Our Express Application will be triggered by Proxied AWS API Gateway HTTP Requests.

When someone issues an HTTP request to the API Gateway, the API Gateway forwards the incoming request to our Lambda formatted as an AWS Event.

A proxied HTTP request to API Gateway transformed to an AWS Event looks like the following

```
{
  resource: '/node-app',
  path: '/node-app',
  httpMethod: 'GET',
  headers: {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'max-age=0',
    Host: 'qbpbf4peoj.execute-api.eu-west-2.amazonaws.com',
    'upgrade-insecure-requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    'X-Amzn-Trace-Id': 'Root=1-5cc96d93-71073b1421b4c5844bf0ead4',
    'X-Forwarded-For': '195.74.139.108',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https'
  },
  multiValueHeaders: {
    accept: [
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
    ],
    'accept-encoding': [ 'gzip, deflate, br' ],
    'accept-language': [ 'en-GB,en-US;q=0.9,en;q=0.8' ],
    'cache-control': [ 'max-age=0' ],
    Host: [ 'qbpbf4peoj.execute-api.eu-west-2.amazonaws.com' ],
    'upgrade-insecure-requests': [ '1' ],
    'User-Agent': [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
    ],
    'X-Amzn-Trace-Id': [ 'Root=1-5cc96d93-71073b1421b4c5844bf0ead4' ],
    'X-Forwarded-For': [ '195.74.139.108' ],
    'X-Forwarded-Port': [ '443' ],
    'X-Forwarded-Proto': [ 'https' ] },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      resourceId: '1cwb7p',
      resourcePath: '/node-app',
      httpMethod: 'GET',
      extendedRequestId: 'Y_4PGGCmLPEFpGA=',
      requestTime: '01/May/2019:09:57:39 +0000',
      path: '/test/node-app',
      accountId: '894330907426',
      protocol: 'HTTP/1.1',
      stage: 'test',
      domainPrefix: 'qbpbf4peoj',
      requestTimeEpoch: 1556704659868,
      requestId: '8e389e89-6bf7-11e9-983e-43d819f1d681',
      identity: {
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: '195.74.139.108',
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        user: null
      },
      domainName: 'qbpbf4peoj.execute-api.eu-west-2.amazonaws.com',
      apiId: 'qbpbf4peoj'
    },
  body: null,
  isBase64Encoded: false
}
```

A Context looks like the following:

```
{
  callbackWaitsForEmptyEventLoop: [Getter/Setter],
  done: [Function: done],
  succeed: [Function: succeed],
  fail: [Function: fail],
  logGroupName: '/aws/lambda/TestNodeApp',
  logStreamName: '2019/05/01/[$LATEST]2ee97571299b4a05b91ab6c4094e8a24',
  functionName: 'TestNodeApp',
  memoryLimitInMB: '128',
  functionVersion: '$LATEST',
  getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
  invokeid: 'e3b9b300-162c-4448-b617-d7d90b863c72',
  awsRequestId: 'e3b9b300-162c-4448-b617-d7d90b863c72',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-2:894330907426:function:TestNodeApp'
}
```

An HTTP Response to an AWS Event could be generated like so

```
const handler = function(event, context, callback) {
  var response = {
    statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: "<h1>Hello world</h1>",
    };

  callback(null, response);
}

module.exports.handler = handler
```

However, we wish to run an Express Application in a Lambda, and have that do what it does - handle HTTP requests, parse Body, routing etc etc

## Serverless HTTP

https://serverless.com/blog/serverless-express-rest-api/

Developed by Doug Moscrop, the serverless-http package is a handy piece of middleware that handles the interface between a Node.js application and the specifics of API Gateway.

Working with a simple Express Application...

```
const express = require('express')
const app = express()

app.get('*', (req, res) => {
  res.json({
    message: 'Hello world'
  })
})

module.exports = app
```

...we can wrap our Express Application with serverless-http, which will essentially transform the AWS Event back into an HTTP Request as expected by Express.

```
const express = require('express')
const serverlessHttp = require('serverless-http')

const app = express()

app.get('*', (req, res) => {
  res.json({
    message: 'Hello world'
  })
})

module.exports.handler = serverlessHttp(app)
```

We're then ready to deploy this exposed handler to a Lambda.

In the examples in this repository, you are able to see the same app running on a Server or on a FaaS provider, such as AWS Lambda.
