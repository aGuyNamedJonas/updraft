#!/usr/bin/env node
import { Construct } from '@aws-cdk/core'

/**
 * @author FirstName LastName <email@address.com> (https://home.page)
 * @headline
 * Short description of your module (will appear in NPM search)
 * @description
 * Description of your udpraft component.
 *
 * Can contain newlines - **Markdown** supported!
 *
 * @feature Cool Feature #1
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

export type TypescriptStarterProps = {}

export class TypescriptStarter extends Construct {
  constructor(parent: Construct, name: string, props: TypescriptStarterProps) {
    super(parent, name)
    // << Insert your implementation here >>
  }
}
