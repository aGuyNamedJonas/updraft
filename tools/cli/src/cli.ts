#!/usr/bin/env node
const { program } = require('commander')
import exampleHandler from './programs/example'
import checkHandler from './programs/check'
import initHandler from './programs/init'
import publishHandler from './programs/publish'
const { version } = require('../package.json')

const commands = [
  {
    command: 'example <udpraft-module>',
    description: 'download runnable examples for updraft modules',
    handler: exampleHandler,
  },
  {
    command: 'init [path]',
    description: 'start a new updraft module',
    handler: initHandler,
  },
  {
    command: 'check [path]',
    description: 'get your updraft module ready for PR',
    handler: checkHandler,
  },
  {
    command: 'publish [path] [diff-target]',
    description: 're-publish updated modules in path',
    handler: publishHandler,
  },
]

program
  .version(version)
  .name('updraft')
  .description('Easily get up & running with runnable examples for updraft modules, start a new updraft module or get your updraft module ready for PR submission.')

commands.forEach(({ command, description, handler }) => {
  program
    .command(command)
    .description(description)
    .action(handler)
})

program.parseAsync(process.argv)
