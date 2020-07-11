import * as chalk from 'chalk'
import {flags} from '@oclif/command'
import Command from './base'
import { verboseFlag } from '../lib/shared'
import { listFiles } from '../lib/fileHelper'
import { getDiff } from '../lib/git'
import { authenticateNpm, publishPackages, getPackageNameAndVersion } from '../lib/npm'
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
    ...Command.flags,
    help: flags.help({char: 'h'}),
    'public-access': flags.boolean({
      default: true,
      description: 'Run the npm publish with the "--access public" flag'
    }),
    'dry-run': flags.boolean({
      default: false,
      description: 'Only check for packages to re-publish, do not actually publish to NPM'
    }),
    'skip-npm-auth': flags.boolean({
      default: false,
      description: `Set this flag to skip NPM authentication (e.g. when using a custom .npmrc or using npm login)`
    }),
    verbose: verboseFlag
  }

  static args = [
    {
      name: 'diff-cmd',
      required: false,
      description: 'Git command to use to detect changes'
    },
  ]

  async run() {
    const include = this.getConfigValue('include')
    const exclude = this.getConfigValue('exclude')
    const dryRun = this.getConfigValue('dry-run', false)
    const skipNpmAuth = this.getConfigValue('skip-npm-auth', false)
    const publicAccess = this.getConfigValue('public-access', false)
    const diffCmd = this.getConfigValue('diff-cmd', 'show')

    const filesToCheck = await listFiles(include, exclude)
    const diffFiles = await getDiff(diffCmd)
    const packagesToPublish = diffFiles.filter(({ fullPath }) => filesToCheck.includes(fullPath))
    const prettyPackagesToPublish = packagesToPublish.map(getPackageNameAndVersion)

    console.log(
      prettyPackagesToPublish.length > 0
      ? chalk.yellow(`Found ${prettyPackagesToPublish.length} package${prettyPackagesToPublish.length === 1 ? '' : 's'} to publish`)
      : chalk.yellow(`Found no package to publish`)
    )
    prettyPackagesToPublish.forEach(({ name, version, fullPath }) => console.log(chalk.bold(name), chalk.green('~> ' + version), '\n', chalk.gray(fullPath)))

    if (prettyPackagesToPublish.length === 0) {
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

    const publishedPackages = await publishPackages(prettyPackagesToPublish, publicAccess)

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
