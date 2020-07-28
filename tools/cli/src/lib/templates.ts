import * as path from 'path'
import * as fs from 'fs'
import { mkDir, listDirs } from '../lib/fileHelper'
var inquirer = require('inquirer')
import { exec } from '../lib/exec'
import chalk = require('chalk')
const fsExtra = require('fs-extra')

/**
 * Retrieves a module from NPM, stores it in the TMPDIR and then returns the contained templates.
 * @param module - Name of the module, including the package scope (e.g. @updraft/aws-static-site)
 * @returns Array of directories that are available as templates
 */
export const retrieveTemplates = async (module: string) => {
  const moduleName = module === '@updraft' ? '@updraft/templates' : module
  console.log('')
  console.log(`Retrieving templates for:\n${chalk.green(moduleName)}\n`)
  const tmpDir = path.join(process.env.TMPDIR, 'updraft')
  mkDir(tmpDir)
  process.chdir(tmpDir)
  await exec(`npm install --prefix ${tmpDir} ${moduleName}`)
  process.chdir(`./node_modules/${moduleName}`)
  const examplesExist = fs.existsSync('./templates')
  let availableTemplates = []
  if (examplesExist) {
    availableTemplates = await listDirs('./templates') as any []
  }

  return availableTemplates
}

export const promptTemplateSelection = async (templates: string[]) => {
  // TODO: Add debugging of the following structure: Log entry conditions, log waypoints (e.g. the HELP_ME_DECIDE route) and log exit conditions (return null)
  // TODO: Do logging in a way that a person could paste a JSON / Markdown log which is easy to read and makes it clear what happened
  const { selectedTemplate } = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'selectedTemplate',
        message: 'Which template do you want to download?',
        choices: [
          ...templates,
        ]
      },
    ])

  console.log('SelectedTemplate: ', selectedTemplate)
  return selectedTemplate
}

export const promptDestination = async (defaultValue?: string) => {
  const { targetPath } = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'targetPath',
        message: 'Name of folder to install template to:',
        default: defaultValue || ''
      }
    ])

  return targetPath
}

  /**
   * TODO: Make sure that this command can be used with private registries as well
   * @param moduleName 
   * @param selectedTemplate 
   * @param callerPath 
   * @param dstPath 
   */
  export const installTemplate = async (moduleName: string, selectedTemplate: string, callerPath: string, dstPath: string) => {
    // TODO: Add extensive debugging to all commands to be able to debug cli interactions with a --verbose or --debug flag
    // TODO: E2E test all user flows that are present in this cli (including submitting a module for PR)
    // console.log(chalk.yellow('Installing module...'), JSON.stringify({ moduleName, selectedTemplate, callerPath, dstPath }))
    console.log(chalk.yellow('Installing module...'))
    const exampleSourcePath = path.join(process.env.TMPDIR, 'updraft', 'node_modules', moduleName, 'templates', selectedTemplate)
    const exampleDestinationPath = path.join(callerPath, dstPath)
    process.chdir(callerPath)

    await fsExtra.ensureDir(exampleDestinationPath)
    await fsExtra.copy(exampleSourcePath, exampleDestinationPath)
    process.chdir(exampleDestinationPath)
    await exec(`npm install`)
    console.log('')
    console.log(chalk.green(`Download & Installation successful!`))
    console.log('')
    console.log(`Get started:`)
    console.log(`${chalk.cyan(`cd ./${dstPath} && npm run deploy`)}`)
    console.log('')
    console.log(chalk.yellow('Happy Hacking!'))
    console.log('')
  }
