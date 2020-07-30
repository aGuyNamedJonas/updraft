import * as path from 'path'
import * as chalk from 'chalk'
import { getRepoBasePath, getDiff } from './git'
import Command, {flags} from '@oclif/command'
import { fileExists, listFiles } from './fileHelper'
import { getPackageNameAndVersion, NpmPackage } from './npm'

export default abstract class extends Command {
  /**
   * Flags that should be available in every command
   *
   * >> FOR ALL SHARED FLAGS <<
   * Please don't use the "default" attribute, set them in configDefaults instead!
   * (This ensures that we can differentiate between flags & args from the command line vs. from defaults)
   */
  static globalFlags = {
    help: flags.help({char: 'h'}),
    verbose: flags.boolean({
      default: false,
      description: 'Enable verbose output (=debug output)'
    })
  }

  /**
   * Flags available in commands that run based on detecting changed modules (publish, doc, check)
   */
  static changedModulesFlags = {
    'include': flags.string({
      description: 'Glob pattern specifying which files to consider for publish & docs (default "./package.json")',
      required: false,
    }),
    'exclude': flags.string({
      description: 'Glob pattern specifying which files to exclude from consideration for publish & docs (default to "")',
      required: false,
    })
  }

  static changedModulesArgs = [
    {
      name: 'diff-cmd',
      required: false,
      description: 'Git command to use to detect changes'
    }
  ]

  private configFile = {}
  private configValues = {}
  private configDefaults = {
    include: './package.json',
    exclude: '',
    'diff-cmd': 'show',
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
   * Attempts to load the updraft.config.js config file.
   * Any explicitly set options / flags will overwrite values from a config file.
   * The CLI will look in two places (preferring the first over the latter):
   *
   * 1. process.cwd() (where the CLI is currently executed)
   * 2. Repository basepath
   */
  async loadConfigFile() {
    const cwdConfigFilePath = path.join(process.cwd(), 'updraft.config.js')
    const repoRootConfigFilePath = path.join(await getRepoBasePath(), 'updraft.config.js')

    const cwdConfigExists = fileExists(cwdConfigFilePath)
    const repoConfigExists = fileExists(repoRootConfigFilePath)

    const tryToLoadConfigFile = (configFilePath: string) => {
      let configFile
      try {
        configFile = require(configFilePath)
      } catch (error) {
        console.log(chalk.red('Error while trying to load config file:\n'), chalk.gray(configFilePath), '\n\n', error.toString())
        console.trace()
        console.log('')
        process.exit(1)
      }

      const { alias } = configFile
      console.log(chalk.yellow(`Config file loaded ${alias ? `(${alias})` : ''}`), '\n', chalk.gray(cwdConfigFilePath), '\n')
      return configFile
    }

    if (cwdConfigExists) {
      return tryToLoadConfigFile(cwdConfigFilePath)
    }

    if (repoConfigExists) {
      return tryToLoadConfigFile(repoRootConfigFilePath)
    }

    console.log(chalk.yellow('No config file found, checked:'))
    console.log(chalk.gray(cwdConfigFilePath))
    console.log(chalk.gray(repoRootConfigFilePath))
    return {}
  }

  /**
   * Returns a list of changed NPM packages, using the provided "diff-cmd"
   * and filtering with the provided "include" and "exclude" glob patterns.
   *
   * Commands that want to use this command should include the changeModuleFlags
   * and the changedModuleArgs into their flags / args.
   */
  async getChangedModules () {
    const include = this.getConfigValue('include')
    const exclude = this.getConfigValue('exclude')
    const diffCmd = this.getConfigValue('diff-cmd')

    const filesToCheck = await listFiles(include, exclude)
    const diffFiles = await getDiff(diffCmd)
    const packagesToPublish = diffFiles.filter(({ fullPath }) => filesToCheck.includes(fullPath))
    const packagesWithNamesAndVersion = packagesToPublish.map(getPackageNameAndVersion)

    return packagesWithNamesAndVersion as NpmPackage[]
  }

  async init() {
    const { args, flags } = this.parse(this.constructor as any)
    this.configValues = { ...args, ...flags as Object }

    this.configFile = await this.loadConfigFile()

    console.log('Running @updraft/cli with options:')
    console.log(JSON.stringify(this.configFile, null, 2))
    console.log(JSON.stringify(this.configValues, null, 2))
    console.log('')
  }

  /**
   * Handles unexpected errors during execution of the commands.
   * This catch function should only handle unexpected errors - please use process.exit(1) for any runtime errors
   * that you can anticipate.
   */
  async catch(err) {
    console.log(chalk.red('CLI error:\n'), err.toString())
    console.log('')
    console.trace()
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
