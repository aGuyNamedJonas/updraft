import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import getVersionUpgrades from '../versionUpgrades'

const templatePackageJson = require('../../../../modules/typescript/creator-templates/templates/typescript-starter/package.json')

const opts = {
  packageScope: '@updraft',
  homepage: 'https://github.com/aGuyNamedJonas/updraft',
  repositoryBasepath: 'https://github.com/aGuyNamedJonas/updraft/tree/master/modules/typescript/',
  license: 'MIT',
  licensePath: 'https://github.com/aGuyNamedJonas/updraft/blob/master/LICENSE',
}

enum STATUS {
  PASSED = 'PASSED',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

enum VALUES {
  SIMPLICITY = 'Simplicity',
  NO_ENTRY_BARRIERS = 'No entry barriers',
  EMPOWERMENT = 'Empowerment',
}

type RulesResult = {
  status: STATUS,
  title: string,
  debugHelp?: string,
}

type RuleValueFit = {
  value: VALUES,
  explanation?: string,
}

const assertError = (condition: boolean, title: string, debugHelp: string, valuefit: RuleValueFit) => {
  if (condition) {
    return {
      status: STATUS.PASSED,
      title,
      valuefit,
    } as RulesResult
  } else {
    return {
      status: STATUS.ERROR,
      title,
      valuefit,
      debugHelp
    }
  }
}

const assertWarn = (condition: boolean, title: string, debugHelp: string, valuefit: RuleValueFit) => {
  if (condition) {
    return {
      status: STATUS.PASSED,
      title,
      valuefit,
    } as RulesResult
  } else {
    return {
      status: STATUS.WARN,
      title,
      valuefit,
      debugHelp
    }
  }
}

const simplicity = (explanation?: string) => ({
  value: VALUES.SIMPLICITY,
  explanation
}) as RuleValueFit

const noEntryBarriers = (explanation?: string) => ({
  value: VALUES.NO_ENTRY_BARRIERS,
  explanation
}) as RuleValueFit

const empowerment = (explanation?: string) => ({
  value: VALUES.EMPOWERMENT,
  explanation
}) as RuleValueFit

const checkPackage = (packageJson, packageJsonPath) => {
  let results = [] as RulesResult[]
  const { name: packageName, version, description, repository, homepage, license, main, types } = packageJson
  const scopeName = packageName.split('/')[0]
  const moduleName = packageName.split('/')[1]
  const parentFolderName = path.dirname(packageJsonPath).split('/').slice(-1)[0]

  results.push(
    assertError(
      scopeName === opts.packageScope,
      `Uses ${opts.packageScope} package scope`,
      `Wrong / missing scope. Property "name" of package.json needs to start with the scope "${opts.packageScope}" (e.g. "${opts.packageScope}/aws-my-updraft-module")`,
      simplicity('We increase simplicity by bundling packages together into one package-scope')
    )
  )

  results.push(
    assertError(
      moduleName.startsWith('aws-'),
      `Module name has "aws" provider prefix`,
      `Wrong / missing provider. All module package names need to start with "aws" (currently the only supported infrastructure provider of the CDK) "${opts.packageScope}" (e.g. "${opts.packageScope}/aws-my-updraft-module")`,
      noEntryBarriers('We believe that in the future the CDK model will be available for all kinds of infrastructure providers.')
    )
  )

  results.push(
    assertError(
      !!version,
      `Version is set`,
      `"version" field in package.json not set. Please use "npm version" to set a version`,
      simplicity('This would break the build later - better catch it now ;)')
    )
  )

  results.push(
    assertError(
      !!description,
      `Description is set`,
      `"description" field in package.json not set. The description is displayed in the NPM search and makes it easy for people to find the right package. Please use the form "CDK Module that ..."`,
      simplicity('A good description makes it much easier to find the right package')
    )
  )

  results.push(
    assertWarn(
      description.startsWith('CDK Module '),
      `Description starts with "CDK Module"`,
      `We recommend that the package.json field "description" starts with "CDK Module". E.g.: "CDK Module that sets up a static site with cloudfront distribution on AWS"`,
      simplicity('We want to make sure people understand what an updraft module is - already in the NPM search. And the best and most concise explanation seems to be that updraft modules are "CDK Modules".')
    )
  )

  results.push(
    assertError(
      parentFolderName === moduleName,
      `Module name matches folder name`,
      `For simplicity, please make sure foldername == module name. E.g.: /path/aws-my-module/package.json --> "name" in package.json is "${opts.packageScope}/aws-my-module"`,
      simplicity('We think it would be very confusing if folder name !== module name')
    )
  )

  results.push(
    assertError(
      !!repository && repository.startsWith(opts.repositoryBasepath),
      `Repository is set correctly`,
      `Please set the "repository" in package.json to:\n"${opts.repositoryBasepath}${moduleName}"`,
      simplicity(`Setting the "repository" field in package.json to the repository URL ${opts.repositoryBasepath} lets users quickly jump into the code from the NPM registry`)
    )
  )

  results.push(
    assertError(
      !!homepage && homepage === opts.homepage,
      `Homepage is set correctly`,
      `Please set the "homepage" in package.json to:\n"${opts.homepage}"`,
      simplicity(`We want people to easily jump to the project homepage from within NPM to make it easier for them to retrieve project-wide documentation`)
    )
  )

  results.push(
    assertError(
      !!license && license === opts.license,
      `License is set & has correct value`,
      `Please set the "version" field in package.json to:\n"${opts.license}"\n`,
      simplicity(`All modules in the configured scope need to have the same license ("${opts.license}") to match the project wide license:\n${opts.licensePath}`)
    )
  )

  results.push(
    assertWarn(
      main === templatePackageJson.main,
      `Main is as recommended`,
      `We recommend that the package.json field "main" matches that of our template for updraft modules:\n${chalk.underline('https://github.com/aGuyNamedJonas/updraft/tree/master/modules/typescript/templates/ts-updraft-module')}`,
      simplicity('We recommend to use our template for creating new updraft modules. This makes starting new modules really fast, and provides a common structure which makes it easier for others to help improve modules.')
    )
  )

  results.push(
    assertWarn(
      types === templatePackageJson.types,
      `Types is as recommended`,
      `We recommend that the package.json field "types" matches that of our template for updraft modules:\n${chalk.underline('https://github.com/aGuyNamedJonas/updraft/tree/master/modules/typescript/templates/ts-updraft-module')}`,
      simplicity('We recommend to use our template for creating new updraft modules. This makes starting new modules really fast, and provides a common structure which makes it easier for others to help improve modules.')
    )
  )

  return results
}

const printResults = (results: RulesResult[]) => {
  let successCount = 0
  let warnCount = 0
  let errorCount = 0

  const printValue = ({ value, explanation }: RuleValueFit) => {
    console.log('')
    console.log(chalk.cyan('Why is that important?'))
    console.log(`${chalk.blue(value)}${(explanation ? `: ${explanation}` : '')}`)
  }

  const filterStatus = (filter: STATUS) => ({ status }) => filter === status

  const printResultTitleOnly = ({ status, title }: { status: string, title: string }) => {
    if (status === STATUS.PASSED) {
      console.log(chalk.green(`✔ ${title}`))
    }

    if (status === STATUS.WARN) {
      console.log(chalk.yellow(`WARN: ${title}`))
    }

    if (status === STATUS.ERROR) {
      console.log(chalk.red(`✕ ${title}`))
    }
  }

  const printResult = ({ status, title, debugHelp = undefined, valuefit }) => {
    printResultTitleOnly({ status, title })

    if (status === STATUS.PASSED) {
      successCount += 1
    }

    if (status === STATUS.WARN) {
      console.log(debugHelp)
      printValue(valuefit)
      console.log('')
      warnCount += 1
    }

    if (status === STATUS.ERROR) {
      console.log(debugHelp)
      printValue(valuefit)
      console.log('')
      errorCount += 1
    }
  }

  console.log(chalk.bold('SUMMARY'))
  results.forEach(printResultTitleOnly)
  console.log('')
  console.log(chalk.bold('WARNINGS'))
  results.filter(filterStatus(STATUS.WARN)).forEach(printResult)
  console.log('')
  console.log(chalk.bold('ERRORS'))
  results.filter(filterStatus(STATUS.ERROR)).forEach(printResult)
  console.log('')
  console.log(chalk.green(`${successCount} passed`))
  console.log(chalk.yellow((warnCount === 1 ? `1 warning` : `${warnCount} warnings`)))
  console.log(chalk.red((errorCount === 1 ? `1 error` : `${errorCount} errors`)))

  if (warnCount > 0 || errorCount > 0) {
    console.log('')
    console.log(chalk.cyan(`Read more about the updraft ${chalk.blue('values')} here:\n${chalk.underline('https://github.com/aGuyNamedJonas/updraft/blob/master/docs/VisionValuesMission.md#values')}`))
    console.log('')
  }

  if (errorCount > 0) {
    process.exit(1)
  }
}

const checkHandler = (packageFilePath: string) => {
  const { name } = require(packageFilePath)
  console.log(chalk.bold(`CHECKING ${name}`))
  console.log(chalk.grey(packageFilePath))
  console.log('')

  try {
    fs.accessSync(packageFilePath, fs.constants.R_OK)
  } catch (error) {
    console.log(chalk.red(`Cannot read package.json file:\n${packageFilePath}\n`))
    console.log('Error: ', error.toString())
    process.exit(1)
  }

  const packageJsonFile = fs.readFileSync(packageFilePath, { encoding: 'utf-8' })
  const packageJson = JSON.parse(packageJsonFile)
  const packageResults = checkPackage(packageJson, packageFilePath)

  const testResults = [
    ...packageResults,
  ]

  printResults(testResults)
}

export default class Templates extends Command {
  static description = 'Get your updraft module ready for PR submission\nThis command is used to green-light your module submissions.'

  static examples = [
    `$ updraft check
Checks the updraft module in the current directory
`,
    `$ updraft templates ./aws-my-amazing-module
Checks the updraft module in the folder "./aws-my-amazing-module"
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    multimode: flags.boolean({
      default: false,
      description: 'runs checks on first layer of subfolders in PATH',
    })
  }

  static args = [
    {
      name: 'modulePath',
      default: './',
      required: false,
      description: 'path of the module(s) to check - defaults to current directory'
    },
  ]

  async run() {
    const {args, flags} = this.parse(Templates)
    const { modulePath } = args
    const { multimode } = flags

    console.log(`Checking updraft module${multimode ? 's' : ''} in path:`)
    console.log(chalk.green(path.resolve(modulePath)))
    console.log('')

    if (multimode) {
      console.log(chalk.yellow(`Checking for changes based on "git diff origin/master..."`))
      const moduleChanges = await getVersionUpgrades(process.cwd(), 'diff origin/master...')
      console.log(moduleChanges.length > 0
                  ? chalk.green(`${moduleChanges.length} module change${moduleChanges.length > 1 ? 's' : ''} detected`)
                  : chalk.yellow('No module changes detected.\n\nIf you want to check individual modules, ignoring git diff change-detection, run updraft check without the --multimode flag')
                 )
      console.log('')

      for (let { modulePackage } of moduleChanges) {
        await checkHandler(modulePackage)
      }
    } else {
      const packageFilePath = path.join(process.cwd(), modulePath, 'package.json')
      await checkHandler(packageFilePath)
    }
  }
}
