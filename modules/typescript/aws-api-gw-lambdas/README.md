# aws-api-gw-lambda
Easily register API endpoints to be handled by a lambda functions.

## Features
* Easily define your API ✓
* CORS Support ✓
* Supports registering with your domain ✓  
(e.g. `api.example.com`)

## Install
`npm install --save @updraft/aws-api-gw-lambda`

## Example
```typescript
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
```

## Templates
### echo
Sets up lambdas and an API Gateway that echos your GET and your POST request.

*Install*  
`updraft templates @updraft/aws-api-gw-lambda echo-js`

*Deploy*  
`cd ./<folder you installed template to> && npm install && npm run deploy`
