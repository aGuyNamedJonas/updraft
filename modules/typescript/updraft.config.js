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
  // The NPM_TOKEN environment variable is set through CircleCI
  'skip-npm-auth': true,
  'diff-cmd': 'diff origin/master...',
  include: './*/package.json',
  'auto-commit': true,
  'readme-template': 'README.md.handlebars',
  'packagejson-template': 'package.json.handlebars',
}

module.exports = config
