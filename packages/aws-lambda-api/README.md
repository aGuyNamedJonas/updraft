# @updraft/aws-lambda-api

> Easily setup an AWS lambda based API

# Features
**✓ Easy route setup** - Easily setup REST APIs pointing to your lambdas    
**✓ Route53 support** - Setup any Route53 (sub)domain to point to this API  
**✓ Local Sources** - Directly deploy your lambdas from local codebase  

# Example
```typescript
import * as cdk from '@aws-cdk/core'
import { RoutingMode, StaticSiteHttps } from '@updraft/aws-static-site-https'

new AwsApiGwMultiLambda(this, 'todo-api', {
  apiName: 'todos',
  apiDescription: 'API to manage todos',
  domainName: 'my-todos.com',
  apiDomainPrefix: 'api',
  apiConfig: [
    {
      resourceName: 'todos',
      integrations: [
        {
          // GET api.my-todos.com/todos
          // --> List of your tasks
          httpMethod: HTTP_METHODS.GET,
          // Using @updraft/aws-lambdas-multi-handler
          handler: taskLambdas.handlers['list']
        },{
          // PUT api.my-todos.com/todos
          // --> Create a new task
          httpMethod: HTTP_METHODS.PUT,
          // Using @updraft/aws-lambdas-multi-handler
          handler: taskLambdas.handlers['create']
        }
      ],
      children: [{
        resourceName: '{todoid}',
        integrations: [
          {
            // GET api.my-todos.com/todos/{todoid}
            // --> Get an individual task
            httpMethod: HTTP_METHODS.GET,
            // Using @updraft/aws-lambdas-multi-handler
            handler: taskLambdas.handlers['get']
          },{
            // PUT api.my-todos.com/todos/{todoid}
            // --> Update an individual task
            httpMethod: HTTP_METHODS.PUT,
            // Using @updraft/aws-lambdas-multi-handler
            handler: taskLambdas.handlers['update']
          },{
            // DELETE api.my-todos.com/todos/{todoid}
            // --> Delete an individual task
            httpMethod: HTTP_METHODS.DELETE,
            // Using @updraft/aws-lambdas-multi-handler
            handler: taskLambdas.handlers['delete']
          }
        ],
        enableCors: true
      }],
      enableCors: true
    },
  ]
})

const cdkApp = new cdk.App()
new StaticHtml(cdkApp, 'my-static-page', {
  env: {
    account: '1234567890',
    region: 'eu-central-1'
  }
})
```

# Install
`yarn add @updraft/aws-lambda-api`

# License
MIT