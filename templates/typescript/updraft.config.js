/**
 * Config file for running updraft cli from this folder.
 * You can also check out the config file we use for
 * the updraft cli: /tools/cli/updraft.config.js
 *
 * --> Create a custom updraft config file (includes docs):
 * updraft templates @updraft/cli config-starter
 */

const config = {
  alias: 'Typescript templates',
  // Use last commit for publication (on squash-merge to master)
  'diff-cmd': 'show',
  'auto-commit': true,
  'public-access': true,
  include: './*/package.json',
}

module.exports = config
