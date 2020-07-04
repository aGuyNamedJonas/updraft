const fs = require('fs')
const path = require('path')
const parse = require('parse-diff')
const chalk = require('chalk')
import { exec } from './shared'
const debug = require('debug')
const logger = debug('versionUpgrades')

const getCurrentCommitDiff = async (diffCommand = 'show') => {
  // logger('getCurrentCommitDiff() %O', { diffCommand })
  const diffRaw = await exec(`git --no-pager ${diffCommand}`)
  const diff = diffRaw.stdout.trim()
  const files = parse(diff)
  // logger('<-- getCurrentCommitDiff %O', { files })
  return files
}

const getRepoPasePath = async () => {
  // logger('getRepoBasePath()')
  const repoBasePath = await exec('git rev-parse --show-toplevel')
  const trimmedBasePath = repoBasePath.stdout.trim()
  // logger('<-- getRepoBasePath %O', { trimmedBasePath })
  return trimmedBasePath
}

/**
 * Generates a RegExp that matches any package.json file in the first subfolder layer beyond the current working directory.
 * @param basePathAbs - Absolute base path to use for matching
 * @returns patchMatcher - RegExp that matches package.json files in first subfolder layer
 */
export const getPackageInSubfolderMatcher = (basePathAbs: string) => {
  const escapeForRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pathMatcher = new RegExp(`${escapeForRegExp(basePathAbs)}\/\\w*(-\\w*)*\/package\.json`, 'g')
  return pathMatcher
}

const filterTsModulePackageChanges = (repoBasePath: string, pathMatcher: RegExp) => (fileChange) => {
  const absChangePath = path.join(repoBasePath, fileChange.to)
  const isTypescriptModule = absChangePath.match(pathMatcher)
  const isChangeToPackageJson = fileChange.to.endsWith('package.json')
  const isTsModulePackageChange = isTypescriptModule && isChangeToPackageJson
  // logger('filterTsModulePackageChanges() %O', { fileChange, absChangePath, isTypescriptModule, isChangeToPackageJson })
  // logger('<-- filterTsModulePackageChanges %O', { isTsModulePackageChange })

  return isTsModulePackageChange
}

const mapFileNameAndChanges = ({ to, chunks }) => {
  const filePathRaw = to
  const fileName = path.basename(filePathRaw)
  const filePath = path.dirname(filePathRaw)

  const allChanges = []
  chunks.forEach(chunk => allChanges.push(chunk.changes))
  const changes = (allChanges as any).flat()

  return { fileName, filePath, changes }
}

const filterVersionUpgrades = ({ changes }) => {
  const findVersionUpgrade = ({ content }) => content.includes('\"version\":')
  const hasVersionUpgrade = changes.find(findVersionUpgrade)
  return hasVersionUpgrade !== undefined
}

const mapVersionUpgrades = (repoBasePath) => ({ fileName, filePath }) => {
  const rawPackageFile = fs.readFileSync(path.join(repoBasePath, filePath, fileName), { encoding: 'utf-8' })
  const { name, version } = JSON.parse(rawPackageFile)
  const modulePath = path.join(repoBasePath, filePath)
  const packageFile = path.join(modulePath, 'package.json')
  return { name, modulePackage: packageFile, path: modulePath, version }
}

/**
 * Returns all updated package.json files with path, and new version number.
 * This is accomplished by running a git diff (in the location of process.cwd())
 * @param absSearchPath 
 * @param diffCommand 
 */
const detectPackageJsonUpgrades = async (diffCommand = 'diff origin/master...') => {
  logger('getVersionUpgrades(%O)', { diffCommand })
  const repoBasePath = await getRepoPasePath()
  logger({ repoBasePath })

  const pathMatcher = getPackageInSubfolderMatcher(process.cwd())
  logger({ pathMatcher })

  const fileChanges = await getCurrentCommitDiff(diffCommand)
  logger({ fileChanges })

  const typescriptModuleChanges = fileChanges.filter(
                                    filterTsModulePackageChanges(repoBasePath, pathMatcher)
                                  )
  logger({ typescriptModuleChanges })

  const simplifiedChangeSet = typescriptModuleChanges.map(mapFileNameAndChanges)
  logger({ simplifiedChangeSet })

  const versionUpgradesChangeSet = simplifiedChangeSet.filter(filterVersionUpgrades)
  logger({ versionUpgradesChangeSet })

  const tsModulesVersionUpgrades = versionUpgradesChangeSet.map(
                                     mapVersionUpgrades(repoBasePath)
                                   )
  logger({ tsModulesVersionUpgrades })

  return tsModulesVersionUpgrades
}

export default detectPackageJsonUpgrades
