import * as path from 'path'
import * as chalk from 'chalk'
import Command from '../lib/base'
import { retrieveTemplates, promptTemplateSelection, promptDestination, installTemplate } from '../lib/templates'

export default class Templates extends Command {
  static description = 'Get up & running with templates - runnable examples for updraft modules, installed directly into your codebase.'

  static examples = [
    `$ updraft templates @updraft
Get a list of templates to get started with building your own custom @updraft components.
`,
    `$ updraft templates @updraft/aws-static-site
Opens an interactive prompt, letting you choose which template to download for the @updraft/aws-static-site component.
`,
`$ updraft templates @updraft/aws-lambdas-multi-handler echo .
Installs the "echo" example into your current folder without prompting.
`,
  ]

  static flags = {
    ...Command.globalFlags
  }

  static args = [
    {
      name: 'module',
      required: true,
      description: 'Updraft component from which to get the template from (needs to include scope - e.g. @updraft/aws-static-site)'
    },
    {
      name: 'template',
      required: false,
      description: 'Name of the template to download (will be prompted if not provided)'
    },
    {
      name: 'path',
      required: false,
      description: `Local path to install the template to (default ".")`
    },
  ]

  async run() {
    const module = this.getConfigValue('module')
    const templateName = this.getConfigValue('name')
    const dstPath = this.getConfigValue('path', '.')

    await getTemplatesHandler(module, templateName, dstPath)
  }
}

export const getTemplatesHandler = async (module = '', templateName = '', dstPath = '') => {
  const callerPath = process.cwd()

    const templates = await retrieveTemplates(module)
    if (templates.length == 0) {
      console.log('')
      console.log(chalk.blue(`No templates found - Here's what you can do:`))
      console.log(chalk.green(`#1 Upvote existing template-requests for this module:`))
      console.log(chalk.underline(`https://github.com/aGuyNamedJonas/updraft/issues?q=is%3Aissue+is%3Aopen+%5BTEMPLATE+REQUEST%5D+%40updraft%2F${module}\n`))
      console.log(chalk.green('#2 Create a template-request issue:'))
      console.log(chalk.underline('https://github.com/aGuyNamedJonas/updraft/issues/new\n'))
      console.log(chalk.green('#3 Help build amazing templates:'))
      console.log(chalk.underline('https://github.com/aGuyNamedJonas/updraft/blob/master/CONTRIBUTING.md\n'))
      process.exit(0)
    }

    const selectedTemplate = templateName ? templateName : await promptTemplateSelection(templates)
    if (!selectedTemplate) {
      // TODO: Decide color vs chalk
      // TODO: Add debug / log statements to every exit condition
      // TODO: Add setup templates - strings that can be left throughout code, package.json and other files, prompting user input after installation.
      // Like that it's possible to request data from users after they downloaded a template and guide users through customizing a template.
      // This system could probably really be a format for template strings that contain the title + description and get automatically replaced by
      // updraft cli after user provides a value. This could also be built into updraft doc, so that users can easily get started with
      // a module and decide to provide the neccessary infos later on as well.
      console.log(chalk.yellow('No template selected, exiting'))
      this.exit(0)
    }

    const targetPath = dstPath ? dstPath : await promptDestination(selectedTemplate)
    await installTemplate(module, selectedTemplate, callerPath, targetPath)
}

