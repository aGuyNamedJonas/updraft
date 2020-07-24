import { exec } from './exec'

/**
 * Authenticates with NPM, by writing NPM_TOKEN to the local .npmrc file.
 * This allows us to easily publish in a CI environment where it's easier to
 * set environment variables than to write to the filesystem manually.
 */
export const authenticateNpm = async () => {
  if (!process.env.NPM_TOKEN) {
    throw new Error('NPM_TOKEN needs to be set!')
  }
  await exec('echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc')
}

export type NpmPackage = {
  name: string,
  version: string,
  dir: string,
  fullPath: string,
  errorMessage?: string,
}

/**
 * Publishes a package to NPM. Does not handle authentication.
 * @param npmPackage - package to publish
 * @param publicAccess whether or not to set "--access public" flag when running npm publish
 */
const publishPackageToNpm = (publicAccess: boolean) => async (npmPackage: NpmPackage) => {
  const { dir, fullPath } = npmPackage
  try {
    await exec(`cd ${dir} && npm install && npm publish ${publicAccess ? '--access public' : ''}`)
  } catch (err) {
    return {
      success: false,
      errorMessage: err.toString(),
      ...npmPackage
    }
  }

  return {
    success: true,
    ...npmPackage
  }
}

/**
 * Publishes NPM packages (does not handle authentication)
 * @param npmPackages - List of NPM packages to publish
 * @param publicAccess - Set this flag to specific whether to use the "---access public" flag with npm publish
 * @returns Object containing success(ful) and failed publications
 */
export const publishPackages = async (npmPackages: NpmPackage[], publicAccess: boolean) => {
  const publishing = npmPackages.map(publishPackageToNpm(publicAccess))
  const publishResults = await Promise.all(publishing)
  return {
    success: publishResults.filter(({ success }) => success),
    failed: publishResults.filter(({ success }) => !success),
  }
}

/**
 * Enriches a list of package.json files, by adding the package's names and versions
 * @param npmPackage - An array of NPM packages
 * @returns Input array of NPM packages but with name and version added
 */
export const getPackageNameAndVersion = (npmPackage: NpmPackage) => {
  const { fullPath } = npmPackage
  const { name, version } = require(fullPath)
  return {
    name,
    version,
    ...npmPackage
  }
}
