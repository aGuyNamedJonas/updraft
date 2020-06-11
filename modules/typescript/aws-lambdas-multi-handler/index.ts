#!/usr/bin/env node
import { Construct, Duration } from '@aws-cdk/core'
import * as Lambda from '@aws-cdk/aws-lambda'

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
