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

## Quickstart Templates
**No quickstart templates available for this component yet 😢**  

<br/><br/>
**What are *updraft* templates?**  
> Quickstart templates for *updraft* components provide you with runnable examples for that component.  
Speed up your development workflow by getting started with templates.  

> List available templates: `updraft templates @updraft/aws-static-site` (replace `aws-static-site` with the componentof your choice)

> Install CLI: `npm i -g @updraft/cli`