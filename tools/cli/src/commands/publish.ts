import * as chalk from 'chalk'
import {flags} from '@oclif/command'
import Command from './base'
import { verboseFlag } from '../lib/shared'
import { authenticateNpm, publishPackages } from '../lib/npm'
const debug = require('debug')
const logger = debug('publish')

export default class PublishCommand extends Command {
  static description = `Publish all changed node modules for which the package.json was modified\nYou only need to use this, if you're planning to use updraft to manage your internal CDK component library. Check out the updraft build scripts for inspiration how we use this command to publish to the public @updraft component library on NPM.`

  static examples = [
    `$ export NPM_TOKEN=<Your NPM token> && updraft publish --include="./*/package.json" --exclude=""./templates/**""
We run this command on changes to the master-branch from inside /modules/typescript to re-publish all changed modules (but not their templates). We set these values in /modules/typescript/updraft.json though.
`,
`$ export NPM_TOKEN=<Your NPM token> && updraft publish --include="package.json" "diff origin/master..."
Publish the module in the current folder, if its package.json file was changed compared to the master branch.
`,
`$ updraft publish --include="package.json" --skip-npm-auth "diff origin/master..."
Publishthe module in the current folder, if its package.json file was changed compared to the master branch and use whatever authentication you setup for NPM (e.g. with npm login).
`,
]

  static flags = {
    ...Command.globalFlags,
    ...Command.changedModulesFlags,
    'public-access': flags.boolean({
      description: 'Run the npm publish with the "--access public" flag',
      required: false,
    }),
    'dry-run': flags.boolean({
      description: 'Only check for packages to re-publish, do not actually publish to NPM',
      required: false,
    }),
    'skip-npm-auth': flags.boolean({
      description: `Set this flag to skip NPM authentication (e.g. when using a custom .npmrc or using npm login)`,
      required: false,
    }),
    verbose: verboseFlag
  }

  static args = [...Command.changedModulesArgs]

  async run() {
    const dryRun = this.getConfigValue('dry-run', false)
    const skipNpmAuth = this.getConfigValue('skip-npm-auth', false)
    const publicAccess = this.getConfigValue('public-access', false)

    const changedNpmPackages = await this.getChangedModules()

    console.log(
      changedNpmPackages.length > 0
      ? chalk.yellow(`Found ${changedNpmPackages.length} package${changedNpmPackages.length === 1 ? '' : 's'} to publish`)
      : chalk.yellow(`Found no package to publish`)
    )
    changedNpmPackages.forEach(({ name, version, fullPath }) => console.log(chalk.bold(name), chalk.green('~> ' + version), '\n', chalk.gray(fullPath)))

    if (changedNpmPackages.length === 0) {
      process.exit(0)
    }

    if (dryRun) {
      console.log(chalk.yellow('\nExiting without publication (--dry-run)\n'))
      process.exit(0)
    }

    if (!skipNpmAuth) {
      try {
        await authenticateNpm()
      } catch (error) {
        console.log(chalk.red('\nError while trying to authenticate with NPM:\n'), error.toString())
        process.exit(1)
      }
    } else {
      console.log(chalk.yellow('\nSkipping NPM authentication (--skip-npm-auth)\n'))
    }

    const publishedPackages = await publishPackages(changedNpmPackages, publicAccess)

    const { success, failed } = publishedPackages
    success.forEach(({ name, version, fullPath }) => console.log(name, chalk.green('~> ' + version + ' published'), '\n', chalk.grey(fullPath)))
    console.log('')
    failed.forEach(({ name, version, fullPath, errorMessage }) => console.log(name, chalk.red('~> ' + version + ' publication failed'), '\n', chalk.grey(fullPath), '\n', errorMessage, '\n'))
    console.log('')
    console.log(chalk.green('Published ' + success.length))
    console.log(chalk.red('Failed    ' + failed.length))

    if (failed.length > 0) {
      process.exit(1)
    }

    process.exit(0)
  }
}
