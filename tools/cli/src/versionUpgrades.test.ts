import { getPackageInSubfolderMatcher } from "./versionUpgrades"

describe('getPackageInSubfolderMatcher', () => {
  test('Returns a regular expression', () => {
    const patchMatcher = getPackageInSubfolderMatcher('/some/random/path')
    expect(patchMatcher).toBeInstanceOf(RegExp)
  })

  test('Returned regular expressions matches package.json files in the first subfolders below basePathAbs', () => {
    const basePath = '/some/random/path'
    const packageJsonChildFolder = basePath + '/child_folder/package.json'
    const packageJsonSameFolder = basePath + '/package.json'
    const randomFileChildFolder = basePath + '/child_folder/random.file'
    const packageJsonSubSubFolder = basePath + '/sub/sub_folder/package.json'

    const pathMatcher = getPackageInSubfolderMatcher(basePath)
    expect(packageJsonChildFolder.match(pathMatcher)).toBeTruthy()

    expect(packageJsonSameFolder.match(pathMatcher)).toBeNull()
    expect(randomFileChildFolder.match(pathMatcher)).toBeNull()
    expect(packageJsonSubSubFolder.match(pathMatcher)).toBeNull()
  })
})
