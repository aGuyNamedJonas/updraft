import * as chalk from 'chalk'
import Command from '../lib/base'
import { getTemplatesHandler } from './templates'
export default class InitCommand extends Command {
  static description = 'Start creating a new updraft component (either for submission to updraft or your own library.\nAlias for updraft templates @updraft/templates'

  static examples = [
    `$ updraft init
Shows you a list of templates that you can use to initialize a new updraft component.
`]

  async run() {
    console.log('Hello there!')
    console.log('Thanks for starting a new updraft component.')
    console.log('Just fyi: "updraft init" is just an alias.')
    console.log('You can still use it of course, just letting you know!')
    console.log('')
    console.log(chalk.yellow('Calling "updraft templates @updraft/templates"...'))
    await getTemplatesHandler('@updraft/templates')
  }
}
