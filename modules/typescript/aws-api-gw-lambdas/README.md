
# @updraft/aws-api-gw-lambdas
Easily setup an API Gateway with endpoints that are handled by lambdas.

Setting up API Gateways in AWS can be pretty cumbersome - even when using Terraform or Cloudformation.
This template is here to help on that front - Easily define your API schema and hook it up to your lambdas.


## Features
- **✓ Simple API schema**
- **✓ CORS Support**  
Just set the `CORS` flag for all endpoints that you want `options` handlers to be added for
- **✓ Custom Domains (optional)**  
If you have a Route53 managed domain, simply setup a subdomain for this API (e.g. `api.example.com`)

  

## Install
`npm install --save @updraft/aws-api-gw-lambdas`


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
To see the available quickstart-templates for this module:
- Install the *updraft* cli:  
`npm install --global @updraft/cli`
- Run the `templates` command:  
`updraft templates @updraft/aws-api-gw-lambdas`
