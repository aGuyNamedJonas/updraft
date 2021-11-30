# @updraft/aws-lambda-local

> Lambda function from local code

# Features
**✓ Local Sources** - Directly deploy your lambda from local codebase  
**✓ Refresh on every cdk deploy** - Updates lambda code whenever you deploy  

# Example
```typescript
import * as cdk from '@aws-cdk/core'
import { LambdaLocal } from '@updraft/aws-lambda-local'

class LambdaFromLocalSource extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props) {
    super(scope, id, props)
    new LambdaLocal(this, 'my-lambda-fn', {
      localHandlerCode: '../lambdas/dist',
      // Use the "helloWorld" function exported from "index.js" in "../lambdas/dist" as handler
      handler: 'index.helloWorld',
    })
  }
}

const cdkApp = new cdk.App()
new LambdaFromLocalSource(cdkApp, 'my-static-page', {
  env: {
    account: '1234567890',
    region: 'eu-central-1'
  }
})
```

# Install
`yarn add @updraft/aws-lambda-local`

# License
MIT