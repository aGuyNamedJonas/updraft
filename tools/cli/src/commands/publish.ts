import * as chalk from 'chalk'
import {Command} from '@oclif/command'
export default class InitCommand extends Command {
  static description = 'Create your own updraft module to contribute to updraft or use internally\n\nFunny story actually: This command is just here as a reminder that you can create your own updraft module by using the templates from @updraft/creator-templates (see examples below).'

  static examples = [
    `$ updraft templates @updraft/creator-templates
Get a list of the creator-templates that help you get started with a fresh updraft module
`,
    `$ updraft templates @updraft/creator-templates typescript-starter
Get started with a typescript udpraft module
`]

  async run() {
    console.log('Republishing changed modules...')
  }
}
