import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
import { fstat, mkdir } from 'fs/promises'

// function execute(command, callback){
//   exec(command, function(error, stdout, stderr){ callback(stdout) })
// }

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
  console.log(chalk.green(`Retrieving examples for ${updraftModule}...`))
  const callerPath = process.cwd()
  const tmpDir = path.join(process.env.TMPDIR, 'updraft')
  // console.log(`Installing ${updraftModule} to tmpdir:\n`, tmpDir, '\n')
  mkDir(tmpDir)
  process.chdir(tmpDir)
  await exec(`npm install --prefix ${tmpDir} ${updraftModule}`)
  process.chdir(`./node_modules/${updraftModule}`)
  const examplesExist = fs.existsSync('./examples')
  let examples = []
  if (examplesExist) {
    examples = await listDirs('./examples') as any []
  }
  console.log(examplesExist ? chalk.green(`${examples.length} examples found for ${updraftModule}`) : chalk.yellow(`No examples found for ${updraftModule}`))
  console.log(JSON.stringify(examples, null, 2))
}

export default exampleHandler
