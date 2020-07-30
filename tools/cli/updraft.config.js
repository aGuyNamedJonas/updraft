/**
 * This config file ensures that we can correctly publish the CLI
 * using "updraft publish".
 *
 * --> Create a custom updraft config file (includes docs):
 * updraft templates @updraft/cli config-starter
 */

module.exports = {
  alias: 'CLI Publish Configuration',
  // Use last commit for publication (on squash-merge to master)
  'diff-cmd': 'show',
  'auto-commit': true,
  'public-access': true,
  include: './package.json',
  exclude: './templates/**',
}
