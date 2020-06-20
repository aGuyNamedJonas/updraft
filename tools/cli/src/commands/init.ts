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
    console.log('')
    console.log('Use our creator-templates to get started with a new updraft module:')
    console.log(chalk.green(`$ updraft templates @updraft/creator-templates`))
    console.log('')
    console.log(chalk.blue(`Want to share your module with the world? Check out our guide:`))
    console.log(chalk.underline('https://github.com/aGuyNamedJonas/updraft/blob/master/CONTRIBUTING.md'))
    console.log('')
  }
}
