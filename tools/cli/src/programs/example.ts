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
  console.log('')
  console.log(`Retrieving examples for:\n${chalk.green(updraftModule)}`)
  const callerPath = process.cwd()
  const tmpDir = path.join(process.env.TMPDIR, 'updraft')
  mkDir(tmpDir)
  process.chdir(tmpDir)
  await exec(`npm install --prefix ${tmpDir} ${updraftModule}`)
  process.chdir(`./node_modules/${updraftModule}`)
  const examplesExist = fs.existsSync('./examples')
  let examples = []
  if (examplesExist) {
    examples = await listDirs('./examples') as any []
  }
  console.log('')
  console.log(examplesExist ? chalk.green(`${examples.length} examples found`) : chalk.yellow(`No examples found for ${updraftModule}`))
  if (!examplesExist) {
    const moduleRequestUrl = newGithubIssueUrl({
      user: 'aGuyNamedJonas',
      repo: 'updraft',
      title: `[EXAMPLE REQUEST] ${updraftModule}`,
      body: `Dear maintainer of this module,\nHere are three incredibly charming reasons why I think it would be a lovely idea if you could add examples to your amazing updraft module "${updraftModule}".\n1. <Insert charming reason No. 1>\n2. <Insert charming reason No. 2>\n3. <Insert charming reason No. 3>\n\nNow that I think about it, I actually noticed that I can be an Open Source Contributor, too - so I might actually get to work on this myself.\n\nThanks again for your work on this module & have a splendid day!`
    });

    console.log(chalk.blue(`No examples found? Here's what you can do:`))
    console.log(chalk.green(`#1 Upvote the example-request issue:`))
    console.log(`https://github.com/aGuyNamedJonas/updraft/issues?q=is%3Aissue+is%3Aopen+%5BEXAMPLE+REQUEST%5D+${updraftModule}\n`)
    console.log(chalk.green(`#2 Create an example-request issue:`))
    console.log(`${moduleRequestUrl}\n`)
    console.log(chalk.green(`#3 Contribute the examples yourself:`))
    console.log(`https://github.com/aGuyNamedJonas/updraft/CONTRIBUTING.md\n`)

    process.exit(0)
  }

  console.log('')

  const HELP_ME_DECIDE = `Open Github, to help me decide`
  const { selectedExample } = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'selectedExample',
        message: 'Which example do you want to download?',
        choices: [
          ...examples,
          new inquirer.Separator(),
          HELP_ME_DECIDE,
        ]
      },
    ])

  if (selectedExample === HELP_ME_DECIDE) {
    const openGithubUrl = `https://github.com/aGuyNamedJonas/updraft/tree/master/modules/${updraftModule.replace('@updraft', 'typescript')}`
    opn(openGithubUrl)
    process.exit(0)
  }

  const { targetPath } = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'targetPath',
        message: 'Name of folder to copy example to:',
        default: selectedExample
      }
    ])

  const exampleSourcePath = path.join(process.env.TMPDIR, 'updraft', 'node_modules', updraftModule, 'examples', selectedExample, '*')
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

export default exampleHandler
