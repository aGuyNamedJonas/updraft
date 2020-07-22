/**
 * Config file for running updraft cli from this folder.
 * You can also check out the config file we use for
 * the updraft cli: /tools/cli/updraft.config.js
 *
 * --> Create a custom updraft config file (includes docs):
 * updraft templates @updraft/cli config-starter
 */

const config = {
  alias: 'Typescript Components Config',
  'skip-npm-auth': true,
  'diff-cmd': 'diff origin/master...',
  include: './*/package.json',
  exclude: './templates/**',
}

module.exports = config
