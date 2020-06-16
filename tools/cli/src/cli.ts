#!/usr/bin/env node
const { program } = require('commander')
import exampleHandler from './programs/example'
import checkHandler from './programs/check'
import initHandler from './programs/init'
const { version } = require('../package.json')

const commands = [
  {
    command: 'example <udpraft-module>',
    description: 'download runnable examples for updraft modules',
    handler: exampleHandler,
  },
  {
    command: 'init [path]',
    description: 'bootstrap a new updraft module',
    handler: initHandler,
  },
  {
    command: 'check [path]',
    description: 'get your updraft module ready for PR submission',
    handler: checkHandler,
  },
]

program
  .version(version)
  .name('updraft')
  .description('CLI of the updraft project - easily get up & running with examples, initialize a new module for yourself, or get help checking your updraft module before submitting it as a PR.')

commands.forEach(({ command, description, handler }) => {
  program
    .command(command)
    .description(description)
    .action(handler)
})

program.parseAsync(process.argv)
