import { exec } from './exec'
const diffParse = require('parse-diff')
import * as path from 'path'

/**
 * Maps the output from diffParse() to become an array with fileName, filePath, fullPath, and changes.
 * @param basePath - Base path of the repository
 * @returns An array in which the detected file changes are described with fileName, filePath, fullPath, and changes
 */
const mapFileNameAndChanges = (basePath: string) => ({ to, chunks }) => {
  const fullPath = path.join(basePath, to)
  const fileName = path.basename(fullPath)
  const dir = path.dirname(fullPath)

  const allChanges = []
  chunks.forEach(chunk => allChanges.push(chunk.changes))
  const changes = (allChanges as any).flat()

  return { fileName, dir, fullPath, changes }
}

/**
 * Returns a diff of files
 * @param diffCommand - $ git <diffCoammnd> is used to calculate the diff. Use "show" to compare with the last commit. Use "diff origin/master..." to get all changes compared with the master branch
 */
export const getDiff = async (diffCommand = 'show') => {
  const diffRaw = await exec(`git --no-pager ${diffCommand}`)
  const diff = diffRaw.stdout.trim()
  const files = diffParse(diff)
  const repoBasePath = await getRepoBasePath()

  return files.map(mapFileNameAndChanges(repoBasePath))
}

/**
 * Returns the absolute base path of the current git repo.
 */
export const getRepoBasePath = async () => {
  const repoBasePath = await exec('git rev-parse --show-toplevel')
  const trimmedBasePath = repoBasePath.stdout.trim()
  return trimmedBasePath
}
