import * as fs from 'fs'
import { spawn } from 'child_process'

export const exec = async (cmd: string, cb = (data: string) => {}): Promise<{ stdout: string, stderr: string }> => {
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

export const mkDir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

export const listDirs = (path: string) => {
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
