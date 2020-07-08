#!/usr/bin/env node
import { Construct, Duration } from '@aws-cdk/core'
import * as Lambda from '@aws-cdk/aws-lambda'

type Env = { key: string, value: string }
export type LambdasMultiHandlerProps = {
  handlerNames: string[]
  localCodePath: string
  timeoutSec?: number
  // Defaults to Node.js v12 - just because that's a personal favorite 🤓
  runtime?: Lambda.Runtime
  rootExport?: string
  env?: {
    [handlerName: string]: Env[]
  }
}

export class AwsLambdasMultiHandler extends Construct {
  handlers: { [handlerName: string]: Lambda.Function }

  constructor(parent: Construct, name: string, {
    handlerNames,
    localCodePath,
    timeoutSec = 3,
    runtime = Lambda.Runtime.NODEJS_12_X,
    rootExport = 'index',
    env = {}
  }: LambdasMultiHandlerProps) {
    super(parent, name)
    this.handlers = {}
    handlerNames.forEach(
      handlerName => this.createLambda(
        handlerName,
        runtime,
        timeoutSec,
        rootExport,
        localCodePath,
        env[handlerName] ? env[handlerName] : []
      )
    )
  }

  createLambda (handlerName: string, runtime: Lambda.Runtime, timeoutSec: number, rootExport: string, localCodePath: string, env: Env[]) {
    const handler = new Lambda.Function(this, handlerName, {
      runtime,
      timeout: Duration.seconds(timeoutSec),
      handler: `${rootExport}.${handlerName}`,
      code: Lambda.Code.asset(localCodePath),
      // This enforces updates on redeploy
      description: `Version: ${new Date().toISOString()}`
    })
    env.forEach(({ key, value }) => {
      handler.addEnvironment(key, value)
    })

    this.handlers[handlerName] = handler
  }
}
