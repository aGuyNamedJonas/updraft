/**
 * This config file sets values for the flags & arguments
 * so that you can use the udpraft CLI without any further
 * arguments.
 *
 * To see the documentation for the values used here,
 * check out the documentation for the updraft cli commands
 * by running $ updraft --help
 */

const config = {
  alias: 'Typescript Components Config',
  'skip-npm-auth': true,
  'diff-cmd': 'diff origin/master...',
  include: './*/package.json',
  exclude: './templates/**',
  'auto-commit': true,
  'readme-template': './config/README.md.handlebars',
  'packagejson-template': './config/package.json.handlebars',
}

module.exports = config
