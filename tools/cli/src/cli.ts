#!/usr/bin/env node
const fs = require('fs')
const { program } = require('commander')
import exampleHandler from './programs/example'
import checkHandler from './programs/check'
import initHandler from './programs/init'

const getVersionFromPackage = () => {
  const packageRaw = fs.readFileSync('../package.json')
  const { version } = JSON.parse(packageRaw)
  return version
}

const commands = [
  {
    command: 'example <udpraft-module> [path]',
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
  .version(getVersionFromPackage())
  .name('updraft')
  .description('CLI of the updraft project - easily get up & running with examples, initialize a new module for yourself, or get help checking your updraft module before submitting it as a PR.')

commands.forEach(({ command, description, handler }) => {
  program
    .command(command)
    .description(description)
    .action(handler)
})

program.parse(process.argv)
