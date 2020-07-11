import * as chalk from 'chalk'
import {flags} from '@oclif/command'
import Command from './base'
import { exec } from '../lib/exec'
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
    help: flags.help({char: 'h'}),
    publicaccess: flags.boolean({
      default: true,
      description: 'run the npm publish with the "--access public" flag'
    }),
    dryrun: flags.boolean({
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
      name: 'modulePath',
      default: './',
      required: false,
      description: 'path of the module(s) to check - defaults to current directory'
    },
    {
      name: 'diffCmd',
      default: 'show',
      required: false,
      description: 'updraft publish will run "git <diffCmd>" to detect changes to modules in "modulePath".\n\nSee examples for ways of how you can use this!'
    },
  ]

  async run() {
    const { args, flags } = this.parse(PublishCommand)
    const { modulePath, diffCmd } = args
    const { publicaccess, verbose, dryrun, 'skip-npm-auth': skipNpmAuth } = flags

    const filesToCheck = await listFiles('./*/package.json', './templates/**')
    const diffFiles = await getDiff('diff origin/master...')
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

    if (dryrun) {
      console.log(chalk.yellow('Exiting without publication (--dryrun)'))
      process.exit(0)
    }

    if (!skipNpmAuth) {
      await authenticateNpm()
    } else {
      console.log(chalk.yellow('\nSkipping NPM authentication (--skip-npm-auth)\n'))
    }

    const publishedPackages = await publishPackages(prettyPackagesToPublish, publicaccess)

    const { success, failed } = publishedPackages
    success.forEach(({ name, version, fullPath }) => console.log(name, chalk.green('~> ' + version + ' published'), '\n', chalk.grey(fullPath)))
    console.log('')
    failed.forEach(({ name, version, fullPath, errorMessage }) => console.log(name, chalk.red('~> ' + version + ' publication failed'), '\n', chalk.grey(fullPath), '\n', errorMessage, '\n'))
    console.log('')
    console.log(chalk.green('Published ' + success.length))
    console.log(chalk.red('Failed    ' + failed.length))

  //   if (verbose) {
  //     console.log(chalk.yellow('Verbose output enabled'))
  //     debug.enable('publish, versionUpgrades')
  //   }

  //   if (dryrun) {
  //     console.log(chalk.yellow('Dry run activated'))
  //   }

  //   logger('Running "publish" command: %O', { args, flags })

  //   console.log(`Checking for changed modules in path:`)
  //   console.log(chalk.green(path.resolve(modulePath)))
  //   console.log('')
  //   console.log(chalk.yellow(`Checking for changes using "git ${diffCmd}"`))
  //   console.log('')

  //   const packageUpgrades = await detectPackageJsonUpgrades(diffCmd)
  //   console.log(packageUpgrades.length > 0
  //               ? chalk.green(`${packageUpgrades.length} module change${packageUpgrades.length > 1 ? 's' : ''} detected`)
  //               : chalk.yellow('No module changes detected.')
  //               )
  //   console.log('')

  //   if (packageUpgrades.length === 0 || dryrun) {
  //     process.exit(0)
  //   }

  //   try {
  //     await publish(packageUpgrades, publicaccess)
  //   } catch (error) {
  //     console.log(chalk.red(`Publication failed:\n${error.toString()}`))
  //     process.exit(1)
  //   }

  //   console.log(chalk.green('Publication successfully completed.'))
  //   process.exit(0)
  }
}
