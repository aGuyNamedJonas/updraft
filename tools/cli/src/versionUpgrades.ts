const fs = require('fs')
const path = require('path')
const parse = require('parse-diff')
const chalk = require('chalk')
import { exec } from './shared'

const getCurrentCommitDiff = async (diffCommand = 'show') => {
  const diffRaw = await exec(`git --no-pager ${diffCommand}`)
  const diff = diffRaw.stdout.trim()
  console.log(chalk.yellow('DEBUG: '), `git --no-pager ${diffCommand}\n`, diff)
  const files = parse(diff)
  console.log(chalk.yellow('DEBUG: '), 'JSON.stringify(files, null, 2): ', JSON.stringify(files, null, 2))
  return files
}

const getRepoPasePath = async () => {
  const repoBasePath = await exec('git rev-parse --show-toplevel')
  return repoBasePath.stdout.trim()
}

const getPathMatcher = (searchPathAbs: string) => {
  const escapeForRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pathMatcher = new RegExp(`${escapeForRegExp(searchPathAbs)}\/\\w*(-\\w*)*\/package\.json`, 'g')
  return pathMatcher
}

const filterTypescriptModuleChanges = (fileChanges, repoBasePath, pathMatcher) => {
  const filterTsModulePackageChanges = (fileChange) => {
    const absChangePath = path.join(repoBasePath, fileChange.to)
    console.log(chalk.yellow('DEBUG: '), 'absChangePath: ', absChangePath)
    console.log(chalk.yellow('DEBUG: '), 'pathMatcher: ', pathMatcher)
    console.log(chalk.yellow('DEBUG: '), 'absChangePath.match(pathMatcher): ', absChangePath.match(pathMatcher))

    const isTypescriptModule = absChangePath.match(pathMatcher)
    console.log(chalk.yellow('DEBUG: '), 'isTypescriptModule: ', isTypescriptModule)

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
    const rawPackageFile = fs.readFileSync(path.join(repoBasePath, filePath, fileName), { encoding: 'utf-8' })
    const { name, version } = JSON.parse(rawPackageFile)
    const modulePath = path.join(repoBasePath, filePath)
    const packageFile = path.join(modulePath, 'package.json')
    return { name, modulePackage: packageFile, path: modulePath, version }
  }

  const typescriptModuleChanges = fileChanges.filter(filterTsModulePackageChanges)
  const simplifiedChangeSet = typescriptModuleChanges.map(mapFileNameAndChanges)
  const versionUpgradesChangeSet = simplifiedChangeSet.filter(filterVersionUpgrades)
  const tsModulesVersionUpgrades = versionUpgradesChangeSet.map(mapVersionUpgrades)

  return tsModulesVersionUpgrades
}

const getVersionUpgrades = async (absSearchPath: string) => {
  const repoBasePath = await getRepoPasePath()
  const pathMatcher = getPathMatcher(absSearchPath)
  const fileChanges = await getCurrentCommitDiff()
  const tsModulesVersionUpgrades = filterTypescriptModuleChanges(fileChanges, repoBasePath, pathMatcher)
  return tsModulesVersionUpgrades
}

export default getVersionUpgrades
