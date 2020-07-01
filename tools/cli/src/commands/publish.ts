import * as chalk from 'chalk'
import * as path from 'path'
import {Command, flags} from '@oclif/command'
import getVersionUpgrades from '../versionUpgrades'
import { exec } from '../shared'

type ModuleChange = {
  name: string,
  version: string,
  modulePackage: string,
  path: string,
}

type PrintModuleProps = {
  name: string,
  version: string,
  modulePackage: string,
  successMessage?: string | undefined,
  errorMessage?: string | undefined
}

const printModuleAndVersion = ({ name, version, modulePackage, successMessage = undefined, errorMessage = undefined }: PrintModuleProps) => {
  console.log(name, chalk.green('~> ' + version))
  console.log(chalk.grey(modulePackage))

  if (successMessage) {
    console.log(chalk.green(successMessage))
  }

  if (errorMessage) {
    console.log(chalk.red(errorMessage))
  }

  console.log('')
}

// TODO: Add error when NPM_TOKEN is not set
const authenticateNpm = async () => exec('echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc')

const publishVersionChanges = async (moduleChanges, publicAccess: boolean) => {
  const publishPackageToNpm = async ({ name, version, modulePackage, path: modulePath }: ModuleChange) => {
    try {
      await exec(`cd ${modulePath} && npm install && npm run build && npm publish ${publicAccess ? '--access public' : ''}`)
    } catch (error) {
      printModuleAndVersion({ name, version, modulePackage, errorMessage: `Failed publishing to NPM:\n${error.toString()}` })
      throw new Error(error)
    }

    printModuleAndVersion({ name, version, modulePackage, successMessage: 'Successfully published to NPM' })
  }

  const publishing = moduleChanges.map(publishPackageToNpm)
  try {
    await Promise.all(publishing)
  } catch (error) {
    throw new Error('Some or all publishing to NPM failed:\n' + error.toString())
  }

  console.log(chalk.yellow(moduleChanges.length === 0 ? '' : `${moduleChanges.length} modules successfully published to NPM`))
}

const publish = async (moduleChanges: ModuleChange[], publicAccess: boolean) => {
  await authenticateNpm()
  moduleChanges.forEach(printModuleAndVersion)
  await publishVersionChanges(moduleChanges, publicAccess)
}

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
    })
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
    }
  ]

  async run() {
    const { args, flags } = this.parse(PublishCommand)
    const { modulePath, diffCmd } = args
    const { publicaccess } = flags

    console.log(`Checking for changed modules in path:`)
    console.log(chalk.green(path.resolve(modulePath)))
    console.log('')
    console.log(chalk.yellow(`Checking for changes using "git ${diffCmd}"`))
    console.log('')

    const moduleChanges = await getVersionUpgrades(process.cwd(), diffCmd)
    console.log(moduleChanges.length > 0
                ? chalk.green(`${moduleChanges.length} module change${moduleChanges.length > 1 ? 's' : ''} detected`)
                : chalk.yellow('No module changes detected.')
                )
    console.log('')

    if (moduleChanges.length === 0) {
      process.exit(0)
    }

    try {
      await publish(moduleChanges, publicaccess)
    } catch (error) {
      console.log(chalk.red(`Publication failed:\n${error.toString()}`))
      process.exit(1)
    }

    console.log(chalk.green('Publication successfully completed.'))
    process.exit(0)
  }
}
