const { promisify } = require('util')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const parse = require('parse-diff')
const chalk = require('chalk')

const exec = async (cmd, opts = {}) => {
  // Default args as defined by https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
  const defaultOpts = {
    shell: true,
    cwd: undefined,
    env: process.env,
  }

  const childProc = spawn(cmd, { ...defaultOpts, opts })
  let stdout = ''
  let stderr = ''
  childProc.stdout.on('data', (data) => {
    stdout += data
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

const getCurrentCommitDiff = async (diffInstructions = 'HEAD~1...') => {
  const diffRaw = await exec(`git --no-pager diff ${diffInstructions}`)
  const diff = diffRaw.stdout.trim()
  const files = parse(diff)
  return files
}

const filterTypescriptModuleChanges = (fileChanges) => {
  const filterTsModulePackageChanges = (fileChange) => {
    const isTypescriptModule = fileChange.to.startsWith('modules/typescript/')
    const isChangeToPackageJson = fileChange.to.endsWith('package.json')

    return isTypescriptModule && isChangeToPackageJson
  }

  const mapFileNameAndChanges = ({ to, chunks }) => {
    const filePathRaw = to
    const fileName = path.basename(filePathRaw)
    const filePath = path.dirname(filePathRaw)

    const allChanges = []
    chunks.forEach(chunk => allChanges.push(chunk.changes))
    const changes = allChanges.flat()

    return { fileName, filePath, changes }
  }

  const filterVersionUpgrades = ({ changes }) => {
    const findVersionUpgrade = ({ content }) => content.includes('\"version\":')
    const hasVersionUpgrade = changes.find(findVersionUpgrade)
    return hasVersionUpgrade !== undefined
  }

  const mapVersionUpgrades = ({ fileName, filePath }) => {
    const rawPackageFile = fs.readFileSync(path.join(filePath, fileName), { encoding: 'utf-8' })
    const { version } = JSON.parse(rawPackageFile)
    return { fileName, filePath, version }
  }

  const typescriptModuleChanges = fileChanges.filter(filterTsModulePackageChanges)
  const simplifiedChangeSet = typescriptModuleChanges.map(mapFileNameAndChanges)
  const versionUpgradesChangeSet = simplifiedChangeSet.filter(filterVersionUpgrades)
  const tsModulesVersionUpgrades = versionUpgradesChangeSet.map(mapVersionUpgrades)

  return tsModulesVersionUpgrades
}

const printModuleAndVersion = ({ fileName, filePath, version, successMessage = null, errorMessage = null }) => {
  const prefix = 'modules/typescript/'
  const suffix = '/package.json'
  const fullPath = path.join(filePath, fileName)
  const moduleName = fullPath.substring(prefix.length, fullPath.indexOf(suffix))
  console.log(moduleName, chalk.green('~> ' + version))

  if (successMessage) {
    console.log(chalk.green(successMessage))
  }

  if (errorMessage) {
    console.log(chalk.red(errorMessage))
  }

  console.log('')
}

const printVersionChanges = (tsModuleVersionUpgrades) => {
  console.log(chalk.yellow(tsModuleVersionUpgrades.length === 0 ? 'No modules upgrades in /modules/typescript/ detected' : `${tsModuleVersionUpgrades.length} module upgrade in /modules/typescript/ detected`))
  tsModuleVersionUpgrades.forEach(printModuleAndVersion)
}

const authenticateNpm = async () => exec('echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc')

const publishVersionChanges = async (tsModuleVersionUpgrades) => {
  const publishPackageToNpm = async ({ fileName, filePath, version }) => {
    const modulePath = path.join(__dirname, '../../', filePath)
    try {
      await exec(`cd ${modulePath} && npm install && npm run build && npm publish --access public`)
    } catch (error) {
      printModuleAndVersion({ fileName, filePath, version, errorMessage: `Failed publishing to NPM:\n${error.toString()}` })
      throw new Error(error)
    }

    printModuleAndVersion({ fileName, filePath, version, successMessage: 'Successfully published to NPM' })
  }

  const publishing = tsModuleVersionUpgrades.map(publishPackageToNpm)
  try {
    await Promise.all(publishing)
  } catch (error) {
    console.log(chalk.red('Some or all publishing to NPM failed (see output)'))
    process.exit(1)
  }

  console.log(chalk.yellow(tsModuleVersionUpgrades.length === 0 ? '' : `${tsModuleVersionUpgrades.length} modules successfully published to NPM`))
}

const main = async () => {
  const fileChanges = await getCurrentCommitDiff()
  const tsModulesVersionUpgrades = filterTypescriptModuleChanges(fileChanges)
  await authenticateNpm()
  printVersionChanges(tsModulesVersionUpgrades)
  publishVersionChanges(tsModulesVersionUpgrades)
}

main()
