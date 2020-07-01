#!/usr/bin/env node
import { Construct } from '@aws-cdk/core'

/**
 * @author Jonas Peeck <hi@aGuyNamedJonas.com> (https://aguynamedjonas.com)
 * @headline
 * SQS buffered webhook processor
 * @description
 * API Gateway that directly writes into a SQS for any HTTP requests it receives.
 * The messages of the SQS are then fed into a lambda function, so that all your lovely events get properly taken care of.
 *
 *
 * @feature Cool Feature #2
 * @featureDescription More extensive explanation of what this feature does
 *
 * @optionalFeature Optional Cool Feature #3
 * @featureDescription As you might have noticed, the description is optional
 *
 * @example
 * ```typescript
 *   // Optionally add a code example here!
 * ```
 */

export type AwsWebhookProcessorProps = {}

class AwsWebhookProcessor extends Construct {
  constructor(parent: Construct, name: string, props: AwsWebhookProcessorProps) {
    super(parent, name)
    // << Insert your implementation here >>
  }
}

export default AwsWebhookProcessor
