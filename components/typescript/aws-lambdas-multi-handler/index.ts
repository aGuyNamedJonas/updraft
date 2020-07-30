#!/usr/bin/env node
import { Construct, Duration } from '@aws-cdk/core'
import * as Lambda from '@aws-cdk/aws-lambda'

/**
 * @author Jonas Peeck <hi@aGuyNamedJonas.com> (https://aGuyNamedJonas.com)
 * @headline
 * Deploy lambdas from a multi-handler codebase
 * @description
 * There's the people who setup a separate project (and package.json) for every lambda,
 * and then there's those kind of people (including myself) who like to keep all lambdas
 * in one project from which multiple handlers are exported.
 *
 * If you're one of those people, who essentially like to keep a monorepo codebase around
 * multiple lambda functions, this module is for you.
 *
 * @feature Single codebase, multi-handler
 * @featureDescription Setup your lambda functions as one project, exporting the handlers you want to use
 *
 * @feature Environment Variables
 * @featureDescription Define environment variables for your lambda functions
 *
 * @feature Local Code Uploads
 * @featureDescription Specify the path to your local codebase, and on deploy your code gets automatically deployed to AWS Lambda
 *
 * @example
 * ```typescript
    const userManagementLambdas = new AwsLambdasMultiHandler(this, 'user-lambdas', {
      handlerNames: ['createUser', 'getUser', 'getNewUsers', 'updateUser', 'deleteUser'],
      localCodePath: '../lambdas/dist',
      timeoutSec: 60,
      env: {
        'createUser': [
          { key: 'MIXPANEL_TOKEN', value: process.env.MIXPANEL_TOKEN }
        ]
      }
    })
 * ```
 */

export type LambdasMultiHandlerProps = {
  handlerNames: string[]
  localCodePath: string
  timeoutSec?: number
  // Defaults to Node.js v12 - just because that's a personal favorite 🤓
  runtime?: Lambda.Runtime
  rootExport?: string
}

export class AwsLambdasMultiHandler extends Construct {
  handlers: { [handlerName: string]: Lambda.Function }

  constructor(parent: Construct, name: string, {
    handlerNames,
    localCodePath,
    timeoutSec = 3,
    runtime = Lambda.Runtime.NODEJS_12_X,
    rootExport = 'index',
  }: LambdasMultiHandlerProps) {
    super(parent, name)
    this.handlers = {}
    handlerNames.forEach(
      handlerName => this.createLambda(handlerName, runtime, timeoutSec, rootExport, localCodePath)
    )
  }

  createLambda (handlerName: string, runtime: Lambda.Runtime, timeoutSec: number, rootExport: string, localCodePath: string) {
    const handler = new Lambda.Function(this, handlerName, {
      runtime,
      timeout: Duration.seconds(timeoutSec),
      handler: `${rootExport}.${handlerName}`,
      code: Lambda.Code.asset(localCodePath),
      // This enforces updates on redeploy
      description: `Version: ${new Date().toISOString()}`
    })
    this.handlers[handlerName] = handler
  }
}
