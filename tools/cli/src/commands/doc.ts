import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
import { exec } from 'child_process'
import { flags } from '@oclif/command'
import { NpmPackage } from '../lib/npm'
import Command from './base'
import { ParsedTag, extractTsDoc } from '../lib/tsdoc'
import { ModuleData, consolidateModuleData, renderReadme, renderPackageJson } from '../lib/render'
const debug = require('debug')
const logger = debug('doc')

/**
 * Generates the package.json and README files for the passed in NpmPackage instance
 * @param npmPackage - Object with information about the NPM package to create docs for
 * @param autoCommit - If true, a commit is created for the updated docs
 * @param readmeTemplatePath - Path to the README.md.handlebars file to use
 * @param packageJsonTemplatePath - Path to the package.json.handlebars file to use
 */
const generateDocs = async (npmPackage: NpmPackage, autoCommit: boolean, readmeTemplatePath: string, packageJsonTemplatePath: string) => {
  const { name, version, fullPath, dir } = npmPackage
  console.log(chalk.bold(name), chalk.green('~> ' + version), '\n', chalk.gray(fullPath))

  const packageJsonPath = path.join(dir, 'package.json')
  let packageJson = {} as any
  try {
    const rawPackageJson = fs.readFileSync(packageJsonPath, { encoding: 'utf8' })
    packageJson = JSON.parse(rawPackageJson)
  } catch (error) {
    console.log(chalk.red(`Failed to load package.json file:\n${packageJsonPath}\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Successfully loaded package.json file'))

  const inputFilePath = path.join(dir, 'index.ts')
  let parsedTags = [] as ParsedTag[]
  try {
    parsedTags = extractTsDoc(inputFilePath)
  } catch (error) {
    console.log(chalk.red(`Failed to process component index.ts file:\n${inputFilePath}\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Successfully parsed TSDoc tags from index.ts'))

  let moduleData = {} as ModuleData
  try {
    moduleData = consolidateModuleData(parsedTags, packageJson)
  } catch (error) {
    console.log(chalk.red(`Failed to convert the parsed tags to module data\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Done consolidating module data'))

  let readme = ''
  try {
    readme = renderReadme(moduleData, readmeTemplatePath)
  } catch (error) {
    console.log(chalk.red(`Failed to render README:\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Successfully rendered README'))

  let updatedPackageJson = ''
  try {
    updatedPackageJson = renderPackageJson(moduleData, packageJson, packageJsonTemplatePath)
  } catch (error) {
    console.log(chalk.red(`Failed to render package.json:\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Successfully rendered package.json'))

  const readmeFilePath = path.join(dir, 'README.md')
  try {
    fs.writeFileSync(readmeFilePath, readme)
  } catch (error) {
    console.log(chalk.red(`Failed to write README:\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Successfully replaced README.md with rendererd README'))

  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2))
  } catch (error) {
    console.log(chalk.red(`Failed to write package.json:\n${error.toString()}`))
    return
  }
  console.log(chalk.green('✓ Successfully wrote updated package.json'))

  if (autoCommit) {
    try {
      process.cwd()
      await exec(`cd ${dir} && git add package.json README.md && git commit -m "Auto-generate update of package.json and README.md for ${packageJson.name}"`)
    } catch (error) {
      console.log(chalk.red(`Error while trying to commit changes to README.md and package.json:\n${error.toString()}`))
      return
    }
    console.log(chalk.green('✓ Successfully committed changes to package.json & README.md'))
  }

  console.log('')
}

export default class Doc extends Command {
  static description = 'Auto-Generates the README and some package.json fields for your updraft module by parsing the tsdoc in your index.ts\n\nAuto-generated READMEs allow us to optimize the user-experience around the overall updraft project as a whole, while you can focus on optimizing the user experience of your own updraft modules.\n\nRun "$ updraft templates @updraft/templates updraft-module-ts" to download the latest example on how to use the tsdoc fields.'

  static examples = [
    `$ updraft doc
Takes the tsdoc from your index.ts and turns it into a README and some package.json fields
`,
  ]

  static flags = {
    ...Command.globalFlags,
    ...Command.changedModulesFlags,
    'auto-commit': flags.boolean({
      description: 'Set this flag to create a commit with the auto-generated README.md and package.json',
      required: false,
    }),
    'readme-template': flags.string({
      description: 'Relative path to the README.md.handlebars template file to use',
      required: false
    }),
    'packagejson-template': flags.string({
      description: 'Relative path to the package.json.handlebars template file to use',
      required: false
    }),
  }

  static args = [
    ...Command.changedModulesArgs,
  ]

  async run() {
    const autoCommit = this.getConfigValue('auto-commit', false)
    const readmeTemplate = this.getConfigValue('readme-template', 'README.md.handlebars')
    const packageJsonTemplate = this.getConfigValue('packagejson-template', 'package.json.handlebars')

    const readmeTempPath = path.join(process.cwd(), readmeTemplate)
    const packageJsonTempPath = path.join(process.cwd(), packageJsonTemplate)

    const changedNpmPackages = await this.getChangedModules()
    console.log(
      changedNpmPackages.length > 0
      ? chalk.yellow(`Found ${changedNpmPackages.length} package${changedNpmPackages.length === 1 ? '' : 's'} to regenerate docs for\n`)
      : chalk.yellow(`Found no package to regenerate docs for\n`)
    )

    if (changedNpmPackages.length === 0) {
      process.exit(0)
    }

    for (let npmPackage of changedNpmPackages) {
      await generateDocs(npmPackage, autoCommit, readmeTempPath, packageJsonTempPath)
    }
  }
}
