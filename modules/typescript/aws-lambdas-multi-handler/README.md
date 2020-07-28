# @updraft/aws-lambdas-multi-handler
There's the people who setup a separate project (and package.json) for every lambda,
and then there's those kind of people (including myself) who like to keep all lambdas
in one project from which multiple handlers are exported.

If you're one of those people, who essentially like to keep a monorepo codebase around
multiple lambda functions, this module is for you.

## Features
**✓ Single codebase, multi-handler** - Setup your lambda functions as one project, exporting the handlers you want to use  
**✓ Environment Variables** - Define environment variables for your lambda functions  
**✓ Local Code Uploads** - Specify the path to your local codebase, and on deploy your code gets automatically deployed to AWS Lambda  
**✓ Testfeature** (optional) - blablablabla  

## Install
`npm install --save @updraft/aws-lambdas-multi-handler`

## Example
```typescript
    const userManagementLambdas = new AwsLambdasMultiHandler(this, 'user-lambdas', {
      handlerNames: ['createUser', 'getUser', 'getNewUsers', 'updateUser', 'deleteUser'],
      localCodePath: '../lambdas/dist',
      timeoutSec: 60,
      env: {
        'createUser': [
          { key: 'MIXPANEL_TOKEN', value: process.env.MIXPANEL_TOKEN }
        
      
    })
```

## Templates
To see the available quickstart-templates for this module:
- Install the *updraft* cli:  
`npm install --global @updraft/cli`
- Run the `templates` command:  
`updraft templates @updraft/aws-lambdas-multi-handler`
