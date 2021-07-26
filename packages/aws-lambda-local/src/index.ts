#!/usr/bin/env node
import { Construct, Duration } from '@aws-cdk/core'
import * as Lambda from '@aws-cdk/aws-lambda'
import { Runtime } from '@aws-cdk/aws-lambda'

export type LocalLambdaProps = {
  localHandlerCode: string,
  handler?: string,
  runtime?: Lambda.Runtime,
  timeout?: Duration,
  description?: string,
}

const LAMBDA_DEFAULT_TIMEOUT = Duration.seconds(3)

export class LocalLambda extends Construct {
  fn: Lambda.Function

  constructor(parent: Construct, name: string, {
    localHandlerCode,
    handler = 'index.handler',
    runtime = Runtime.NODEJS_14_X,
    timeout = LAMBDA_DEFAULT_TIMEOUT,
    description = ''
  }: LocalLambdaProps) {
    super(parent, name)
   
    this.fn = new Lambda.Function(this, name, {
      code: Lambda.Code.fromAsset(localHandlerCode),
      handler,
      runtime,
      timeout,
      // This enforces updates on redeploy
      description: `${description} Version: ${new Date().toISOString()}`
    })
  }
}
