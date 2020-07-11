import * as path from 'path'
import { getRepoBasePath } from '../lib/git'
import Command, {flags} from '@oclif/command'
import * as chalk from 'chalk'
import { fileExists } from '../lib/fileHelper'

export default abstract class extends Command {
  private updraftConfig = {}
  // static flags = {

  // }

  /**
   * Attempts to load the updraft.json config file.
   * Any explicitly set options / flags will overwrite values from a config file.
   * The CLI will look in two places (preferring the first over the latter):
   *
   * 1. process.cwd() (where the CLI is currently executed)
   * 2. Repository basepath
   */
  async loadConfigFile() {
    const cwdConfigFilePath = path.join(process.cwd(), 'updraft.json')
    const repoRootConfigFilePath = path.join(await getRepoBasePath(), 'updraft.json')

    const cwdConfigExists = fileExists(cwdConfigFilePath)
    const repoConfigExists = fileExists(repoRootConfigFilePath)

    if (cwdConfigExists) {
      this.updraftConfig = require(cwdConfigFilePath)
      console.log(chalk.yellow('Config file loaded:'), '\n', chalk.gray(cwdConfigFilePath), '\n')
      return
    }

    if (repoConfigExists) {
      this.updraftConfig = require(repoRootConfigFilePath)
      console.log(chalk.yellow('Config file loaded'), '\n', chalk.gray(repoRootConfigFilePath), '\n')
      return
    }

    console.log(chalk.yellow('No config file found, checked:'))
    console.log(chalk.gray(cwdConfigFilePath))
    console.log(chalk.gray(repoRootConfigFilePath))
  }

  async init() {
    await this.loadConfigFile()
  }



  async catch(err) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    // TODO: Put this into the baseclass instead!
    // TODO: Point people to upgrade option or report an issue
    console.log(chalk.red('CLI error:\n'), err.toString())
    console.log('')
    console.log(chalk.red('This is probably a bug in @updraft/cli, please upvote / create a corresponding issue:'))
    console.log(chalk.bold('https://github.com/aGuyNamedJonas/updraft/labels/cli'))
    process.exit(1)
  }
  async finally(err) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
