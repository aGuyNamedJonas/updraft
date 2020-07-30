import * as fs from 'fs'
import * as path from 'path'
const glob = require('glob')

/**
 * Async version of glob - Using a glob pattern to list files in the current working directory.
 * @param globPattern - Glob pattern to use to list files in process.cwd (e.g. ".\/*\/package.json")
 * @returns List of files
 */
export const globAsync = (globPattern: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(globPattern, (err, files: string[]) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

/**
 * Turns relative files paths (e.g. as returned by globAsync()) and turns them into absolute paths
 * @param relFilePaths - Relative or absolute paths
 * @returns Absolute paths
 */
const toAbsFilePaths = (relFilePaths: string[]) =>
  relFilePaths.map(
    relFilePath => path.resolve(relFilePath)
  )

/**
 * Returns array a without the contents of array b.
 * @param a - Some array
 * @param b - Some other array
 * @returns a - b
 */
export const aWithoutB = (a: any[], b: any[]) =>
  a.filter(aElement => !b.includes(aElement))

/**
 * Lists files using an include glob-pattern and an optional exclude glob-pattern
 * @param include - Glob pattern of files to include
 * @param exclude - (optional) Glob pattern of files to exclude
 * @returns Array of absolute file paths
 */
export const listFiles = async (include: string, exclude = '') => {
  const includeFiles = await globAsync(include)
  const excludeFiles = await globAsync(exclude)

  const includeFilesAbs = toAbsFilePaths(includeFiles)
  const excludeFilesAbs = toAbsFilePaths(excludeFiles)
  return aWithoutB(includeFilesAbs, excludeFilesAbs)
}

/**
 * Creates a new folder, but checks if folder exists first
 * @param path - Path of the new folder to create
 */
export const mkDir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

/**
 * Lists the folders in a certain location
 * @param path - Path to list directories in
 */
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

/**
 * Checks if a file exists
 * @param filePath (Absolute) file path of the file to check
 * @returns true / false to show whether file exists or not
 */
export const fileExists = (filePath: string) => {
  let fileStat
  try {
    fileStat = fs.statSync(filePath)
  } catch (error) {
    return false
  }

  return fileStat.isFile()
}
