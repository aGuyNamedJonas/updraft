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
  static description = 'publish your changed (updraft) modules to a package registry DO NOT USE THIS!\n\nDo not use this - Unless you want to use this to manage your internal updraft module library (e.g. at your company). This command is used by our CI/CD job to publish your modules to the NPM registry.\n\nBefore publishing modules, you might want to run updraft check to run some basic sanity checks across your udpraft modules.'

  static examples = [
    `$ export NPM_TOKEN=<Your NPM token> && updraft publish
Publishes all (node) modules in the first subfolder of the current folder for which the version number was changed in the last commit (e.g. after a pull-request was merged)\n\nHow we use it: updraft publish ./modules/typescript
`,
`$ export NPM_TOKEN=<Your NPM token> && updraft publish ./modules/typescript "diff origin/master..."
Publishes all modules that had their version numbers changed in the folder "modules/typescript" folder compared to the master branch (if you want to do special publish thing in branches other than the master)
`,
]

  static flags = {
    ...Command.flags,
    help: flags.help({char: 'h'}),
    'public-access': flags.boolean({
      default: true,
      description: 'run the npm publish with the "--access public" flag'
    }),
    'dry-run': flags.boolean({
      default: false,
      description: 'only check for packages to re-publish, do not actually publish to NPM'
    }),
    'skip-npm-auth': flags.boolean({
      default: false,
      description: `set this flag to skip NPM authentication (e.g. when you want to use a custom .npmrc instead of setting NPM_TOKEN)`
    }),
    verbose: verboseFlag
  }

  static args = [
    {
      name: 'diff-cmd',
      required: false,
      description: 'git command to use to detect changes'
    },
  ]

  async run() {
    const dryRun = this.getConfigValue('dry-run', false)
    const skipNpmAuth = this.getConfigValue('skip-npm-auth', false)
    const publicAccess = this.getConfigValue('public-access', false)
    const include = this.getConfigValue('include')
    const exclude = this.getConfigValue('exclude')
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
