import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
var inquirer = require('inquirer');
// const newGithubIssueUrl = require('new-github-issue-url')
const opn = require('opn')
import { exec } from '../lib/exec'
import { mkDir, listDirs } from '../lib/fileHelper'

export default class Templates extends Command {
  static description = 'Get up & running with templates - runnable examples for updraft modules, installed directly into your codebase.'

  static examples = [
    `$ updraft templates @updraft
Get a list of templates that you can use to get started with updraft
`,
    `$ updraft templates @updraft/aws-lambdas-multi-handler
Opens an interactive prompt, letting you choose which template to download from that updraft module
`,
`$ updraft templates @updraft/aws-lambdas-multi-handler echo .
Installs the "echo" example into your current folder without prompting
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'module',
      required: true,
      description: 'updraft module from which to get the template from'
    },
    {
      name: 'template',
      required: false,
      description: 'name of the template to download'
    },
    {
      name: 'path',
      required: false,
      description: `local path to install the template to`
    },
  ]

  async retrieveTemplates(module: string) {
    const moduleName = module === '@updraft' ? '@updraft/templates' : module
    this.log('')
    this.log(`Retrieving templates for:\n${chalk.green(moduleName)}`)
    const tmpDir = path.join(process.env.TMPDIR, 'updraft')
    mkDir(tmpDir)
    process.chdir(tmpDir)
    await exec(`npm install --prefix ${tmpDir} ${moduleName}`)
    process.chdir(`./node_modules/${moduleName}`)
    const examplesExist = fs.existsSync('./templates')
    let examples = []
    if (examplesExist) {
      examples = await listDirs('./templates') as any []
    }

    return examples
  }

  async promptTemplateSelection(templates: string[]) {
    // TODO: Add debugging of the following structure: Log entry conditions, log waypoints (e.g. the HELP_ME_DECIDE route) and log exit conditions (return null)
    // TODO: Do logging in a way that a person could paste a JSON / Markdown log which is easy to read and makes it clear what happened
    const HELP_ME_DECIDE = `Open Github, to help me decide`
    const { selectedTemplate } = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'selectedTemplate',
          message: 'Which template do you want to download?',
          choices: [
            ...templates,
            new inquirer.Separator(),
            HELP_ME_DECIDE,
          ]
        },
      ])

    if (selectedTemplate === HELP_ME_DECIDE) {
      const openGithubUrl = `https://github.com/aGuyNamedJonas/updraft/tree/master/modules/${selectedTemplate.replace('@updraft', 'typescript')}`
      opn(openGithubUrl)
      return null
    }

    console.log('selectedTemplate: ', selectedTemplate)
    return selectedTemplate
  }

  async promptDestination(defaultValue?: string) {
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

  async installTemplate(moduleName: string, selectedTemplate: string, callerPath: string, dstPath: string) {
    // TODO: Add extensive debugging to all commands to be able to debug cli interactions with a --verbose or --debug flag
    // TODO: E2E test all user flows that are present in this cli (including submitting a module for PR)
    console.log(chalk.yellow('Installing module...'), JSON.stringify({ moduleName, selectedTemplate, callerPath, dstPath }))
    const exampleSourcePath = path.join(process.env.TMPDIR, 'updraft', 'node_modules', moduleName, 'templates', selectedTemplate, '*')
    const exampleDestinationPath = path.join(callerPath, dstPath)
    process.chdir(callerPath)
    await exec(`mkdir -p ${exampleDestinationPath} && cp -r ${exampleSourcePath} ${exampleDestinationPath}`)
    process.chdir(exampleDestinationPath)
    await exec(`npm install`)
    this.log('')
    this.log(chalk.green(`Download & Installation successful!`))
    this.log('')
    this.log(`Get started:`)
    this.log(`${chalk.cyan(`cd ./${dstPath} && npm run deploy`)}`)
    this.log('')
    this.log(chalk.yellow('Happy Hacking!'))
    this.log('')
  }

  async run() {
    const {args, flags} = this.parse(Templates)
    const { module, name: templateName, path } = args

    const callerPath = process.cwd()

    const templates = await this.retrieveTemplates(module)
    if (templates.length > 0) {
      this.log(chalk.green(`${templates.length} templates found`))
    } else {
      this.log('')
      this.log(chalk.blue(`No templates found - Here's what you can do:`))
      this.log(chalk.green(`#1 Upvote existing template-requests for this module:`))
      this.log(chalk.underline(`https://github.com/aGuyNamedJonas/updraft/issues?q=is%3Aissue+is%3Aopen+%5BTEMPLATE+REQUEST%5D+%40updraft%2F${module}\n`))
      this.log(chalk.green('#2 Create a template-request issue:'))
      this.log(chalk.underline('https://github.com/aGuyNamedJonas/updraft/issues/new\n'))
      this.log(chalk.green('#3 Help build amazing templates:'))
      this.log(chalk.underline('https://github.com/aGuyNamedJonas/updraft/blob/master/CONTRIBUTING.md\n'))
      this.exit(0)
    }

    const selectedTemplate = templateName ? templateName : await this.promptTemplateSelection(templates)
    if (!selectedTemplate) {
      // TODO: Decide color vs chalk
      // TODO: Add debug / log statements to every exit condition
      // TODO: Add setup templates - strings that can be left throughout code, package.json and other files, prompting user input after installation.
      // Like that it's possible to request data from users after they downloaded a template and guide users through customizing a template.
      // This system could probably really be a format for template strings that contain the title + description and get automatically replaced by
      // updraft cli after user provides a value. This could also be built into updraft doc and updraft check, so that users can easily get started with
      // a module and decide to provide the neccessary infos later on as well.
      console.log(chalk.yellow('No template selected, exiting'))
      this.exit(0)
    }

    const targetPath = path ? path : await this.promptDestination(selectedTemplate)
    await this.installTemplate(module, selectedTemplate, callerPath, targetPath)
  }
}

