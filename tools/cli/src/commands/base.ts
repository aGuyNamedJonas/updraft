import * as path from 'path'
import { getRepoBasePath } from '../lib/git'
import Command, {flags} from '@oclif/command'
import * as chalk from 'chalk'
import { fileExists } from '../lib/fileHelper'

export default abstract class extends Command {
  /**
   * Flags available in all commands
   * --> Please don't use the "default" attribute, set them in configDefaults instead!
   * (This ensures that we can differentiate between flags & args from the command line vs. from defaults)
   */
  static flags = {
    'include': flags.string({
      description: 'Glob pattern specifying which files to consider for publish, check, doc (defaults to "./package.json")'
    }),
    'exclude': flags.string({
      description: 'Glob pattern specifying which files to exclude from consideration for publish, check, doc (defaults to "")'
    })
  }

  private configFile = {}
  private configValues = {}
  private configDefaults = {
    include: './package.json',
    exclude: '',
  }

  /**
   * Returns a config value, gets the value from the following sources (in that order)
   * 1. Passed in through the commandline (args & flags)
   * 2. Passed in through updraft.json
   * 3. configDefaults (see above)
   * 3. Provided through the "defaultValue" arg
   * @param key - Flag or attribute key to get
   * @returns config value or undefined if it's not set anywhere
   */
  getConfigValue (key: string, defaultValue = undefined) {
    const value = this.configValues[key] ||
                  this.configFile[key] ||
                  this.configDefaults[key] ||
                  defaultValue ||
                  undefined
    return value
  }

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
      const configFile = require(cwdConfigFilePath)
      console.log(chalk.yellow('Config file loaded:'), '\n', chalk.gray(cwdConfigFilePath), '\n')
      return configFile
    }

    if (repoConfigExists) {
      const configFile = require(repoRootConfigFilePath)
      console.log(chalk.yellow('Config file loaded'), '\n', chalk.gray(repoRootConfigFilePath), '\n')
      return configFile
    }

    console.log(chalk.yellow('No config file found, checked:'))
    console.log(chalk.gray(cwdConfigFilePath))
    console.log(chalk.gray(repoRootConfigFilePath))
    return {}
  }

  async init() {
    const { args, flags } = this.parse(this.constructor)
    this.configValues = { ...args, ...flags }

    this.configFile = await this.loadConfigFile()

    console.log('------')
    console.log(JSON.stringify(this.configFile, null, 2))
    console.log(JSON.stringify(this.configValues, null, 2))
    console.log('------')
  }



  async catch(err) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    // TODO: Put this into the baseclass instead!
    // TODO: Point people to upgrade option or report an issue
    console.log(chalk.red('CLI error:\n'), err.toString())
    console.log('')
    console.log(chalk.red('This is probably a bug in @updraft/cli, please upvote or create the corresponding issue:'))
    console.log(chalk.bold('https://github.com/aGuyNamedJonas/updraft/labels/cli'))
    process.exit(1)
  }
  async finally(err) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}
