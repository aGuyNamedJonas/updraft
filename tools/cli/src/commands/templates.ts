import {Command, flags} from '@oclif/command'
import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
var inquirer = require('inquirer');
const newGithubIssueUrl = require('new-github-issue-url')
const opn = require('opn')

const exec = async (cmd, cb = (data: string) => {}) => {
  // Default args as defined by https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
  const defaultOpts = {
    shell: true,
    cwd: undefined,
    env: process.env,
  }

  const childProc = spawn(cmd, defaultOpts)
  let stdout = ''
  let stderr = ''
  childProc.stdout.on('data', (data) => {
    stdout += data
    cb(data.toString())
  })

  childProc.stderr.on('data', (data) => {
    stderr += data
  })

  return new Promise((resolve, reject) => {
    childProc.on('error', (error) => {
      reject(error)
    })

    childProc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(new Error(`Command failed with exit code ${code}:\n${stderr}`))
    })
  })
}

const mkDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

const listDirs = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

const exampleHandler = async (updraftModule) => {
  
}

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

  async run() {
    const {args, flags} = this.parse(Templates)
    this.log(`Args: ${JSON.stringify(args, null, 2)}`)
    const { module } = args

    console.log('')
    console.log(`Retrieving templates for:\n${chalk.green(module)}`)
    const callerPath = process.cwd()
    const tmpDir = path.join(process.env.TMPDIR, 'updraft')
    mkDir(tmpDir)
    process.chdir(tmpDir)
    await exec(`npm install --prefix ${tmpDir} ${module}`)
    process.chdir(`./node_modules/${module}`)
    const examplesExist = fs.existsSync('./templates')
    let examples = []
    if (examplesExist) {
      examples = await listDirs('./templates') as any []
    }
    console.log('')
    console.log(examplesExist ? chalk.green(`${examples.length} templates found`) : chalk.yellow(`No templates found for ${module}`))
    if (!examplesExist) {
      const moduleRequestUrl = newGithubIssueUrl({
        user: 'aGuyNamedJonas',
        repo: 'updraft',
        title: `[TEMPLATE REQUEST] ${module}`,
        body: `Please describe your use case for a template and how you think it might help this module to live up to our values (Simplicity, No Entry Barriers, Empowerment) even more.`
      });

      console.log('')
      console.log(chalk.blue(`No templates found? Here's what you can do:`))
      console.log(chalk.green(`#1 Search for existing template-request issue (upvote it!):`))
      console.log(chalk.underline(`https://github.com/aGuyNamedJonas/updraft/issues?q=is%3Aissue+is%3Aopen+%5BTEMPLATE+REQUEST%5D+%40updraft%2F${module}\n`))
      console.log(chalk.green(`#2 Create an template-request issue:`))
      console.log(chalk.underline(`${moduleRequestUrl}\n`))
      console.log(chalk.green(`#3 Contribute the template yourself:`))
      console.log(chalk.underline(`https://github.com/aGuyNamedJonas/updraft/CONTRIBUTING.md\n`))

      process.exit(0)
    }

    console.log('')

    const HELP_ME_DECIDE = `Open Github, to help me decide`
    const { selectedExample } = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'selectedExample',
          message: 'Which template do you want to download?',
          choices: [
            ...examples,
            new inquirer.Separator(),
            HELP_ME_DECIDE,
          ]
        },
      ])

    if (selectedExample === HELP_ME_DECIDE) {
      const openGithubUrl = `https://github.com/aGuyNamedJonas/updraft/tree/master/modules/${module.replace('@updraft', 'typescript')}`
      opn(openGithubUrl)
      process.exit(0)
    }

    const { targetPath } = await inquirer
      .prompt([
        {
          type: 'input',
          name: 'targetPath',
          message: 'Name of folder to install template to:',
          default: selectedExample
        }
      ])

    const exampleSourcePath = path.join(process.env.TMPDIR, 'updraft', 'node_modules', module, 'templates', selectedExample, '*')
    const exampleDestinationPath = path.join(callerPath, targetPath)
    process.chdir(callerPath)
    await exec(`mkdir -p ${exampleDestinationPath} && cp -r ${exampleSourcePath} ${exampleDestinationPath}`)
    process.chdir(exampleDestinationPath)
    await exec(`npm install`)
    console.log('')
    console.log(chalk.green(`Download & Installation successful!`))
    console.log('')
    console.log(`Get started:`)
    console.log(`${chalk.cyan(`cd ./${targetPath} && npm run deploy`)}`)
    console.log('')
    console.log(chalk.yellow('Happy Hacking!'))
    console.log('')
  }
}

