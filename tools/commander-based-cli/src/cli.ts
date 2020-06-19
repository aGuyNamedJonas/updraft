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
    options: [
      { flag: '--scope <npm-scope>', desc: 'NPM Scope to use', defaultValue: '@updraft' }
    ]
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
  .description('Easily get up & running with templates (runnable examples) for updraft modules, start a new updraft module or get your updraft module ready for PR submission.')

commands.forEach(({ command, description, handler, options = [] }) => {
  program
    .command(command)
    .description(description)
    .action(handler)

  options.forEach(({ flag, desc, defaultValue = undefined }) => {
    program.option(flag, desc, defaultValue)
  })
})

program.parseAsync(process.argv)
