@updraft/cli
============

Get quickstart templates for updraft moudles, initialize your own updraft module, or chek your module before submitting it as a PR.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@updraft/cli.svg)](https://npmjs.org/package/@updraft/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@updraft/cli.svg)](https://npmjs.org/package/@updraft/cli)
[![License](https://img.shields.io/npm/l/@updraft/cli.svg)](https://github.com/aGuyNamedJonas/updraft/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @updraft/cli
$ updraft COMMAND
running command...
$ updraft (-v|--version|version)
@updraft/cli/0.0.4 darwin-x64 node-v14.3.0
$ updraft --help [COMMAND]
USAGE
  $ updraft COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`updraft check [MODULEPATH]`](#updraft-check-modulepath)
* [`updraft help [COMMAND]`](#updraft-help-command)
* [`updraft init`](#updraft-init)
* [`updraft publish [MODULEPATH] [DIFFCMD]`](#updraft-publish-modulepath-diffcmd)
* [`updraft templates MODULE [TEMPLATE] [PATH]`](#updraft-templates-module-template-path)

## `updraft check [MODULEPATH]`

Get your updraft module ready for PR submission

```
USAGE
  $ updraft check [MODULEPATH]

ARGUMENTS
  MODULEPATH  [default: ./] path of the module(s) to check - defaults to current directory

OPTIONS
  -h, --help   show CLI help
  --multimode  runs checks on first layer of subfolders in PATH

DESCRIPTION
  This command is used to green-light your module submissions.

EXAMPLES
  $ updraft check
  Checks the updraft module in the current directory

  $ updraft templates ./aws-my-amazing-module
  Checks the updraft module in the folder "./aws-my-amazing-module"
```

_See code: [src/commands/check.ts](https://github.com/aGuyNamedJonas/updraft/blob/v0.0.4/src/commands/check.ts)_

## `updraft help [COMMAND]`

display help for updraft

```
USAGE
  $ updraft help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `updraft init`

Create your own updraft module to contribute to updraft or use internally

```
USAGE
  $ updraft init

DESCRIPTION
  Funny story actually: This command is just here as a reminder that you can create your own updraft module by using the 
  templates from @updraft/creator-templates (see examples below).

EXAMPLES
  $ updraft templates @updraft/creator-templates
  Get a list of the creator-templates that help you get started with a fresh updraft module

  $ updraft templates @updraft/creator-templates typescript-starter
  Get started with a typescript udpraft module
```

_See code: [src/commands/init.ts](https://github.com/aGuyNamedJonas/updraft/blob/v0.0.4/src/commands/init.ts)_

## `updraft publish [MODULEPATH] [DIFFCMD]`

publish your changed (updraft) modules to a package registry DO NOT USE THIS!

```
USAGE
  $ updraft publish [MODULEPATH] [DIFFCMD]

ARGUMENTS
  MODULEPATH  [default: ./] path of the module(s) to check - defaults to current directory

  DIFFCMD     [default: show] updraft publish will run "git <diffCmd>" to detect changes to modules in "modulePath".

              See examples for ways of how you can use this!

OPTIONS
  -h, --help      show CLI help
  --publicaccess  run the npm publish with the "--access public" flag

DESCRIPTION
  Do not use this - Unless you want to use this to manage your internal updraft module library (e.g. at your company). 
  This command is used by our CI/CD job to publish your modules to the NPM registry.

  Before publishing modules, you might want to run updraft check to run some basic sanity checks across your udpraft 
  modules.

EXAMPLES
  $ export NPM_TOKEN=<Your NPM token> && updraft publish
  Publishes all (node) modules in the first subfolder of the current folder for which the version number was changed in 
  the last commit (e.g. after a pull-request was merged)

  How we use it: updraft publish ./modules/typescript

  $ export NPM_TOKEN=<Your NPM token> && updraft publish ./modules/typescript "diff origin/master..."
  Publishes all modules that had their version numbers changed in the folder "modules/typescript" folder compared to the 
  master branch (if you want to do special publish thing in branches other than the master)
```

_See code: [src/commands/publish.ts](https://github.com/aGuyNamedJonas/updraft/blob/v0.0.4/src/commands/publish.ts)_

## `updraft templates MODULE [TEMPLATE] [PATH]`

Get up & running with templates - runnable examples for updraft modules, installed directly into your codebase.

```
USAGE
  $ updraft templates MODULE [TEMPLATE] [PATH]

ARGUMENTS
  MODULE    updraft module from which to get the template from
  TEMPLATE  name of the template to download
  PATH      local path to install the template to

OPTIONS
  -h, --help  show CLI help

EXAMPLES
  $ updraft templates @updraft
  Get a list of templates that you can use to get started with updraft

  $ updraft templates @updraft/aws-lambdas-multi-handler
  Opens an interactive prompt, letting you choose which template to download from that updraft module

  $ updraft templates @updraft/aws-lambdas-multi-handler echo .
  Installs the "echo" example into your current folder without prompting
```

_See code: [src/commands/templates.ts](https://github.com/aGuyNamedJonas/updraft/blob/v0.0.4/src/commands/templates.ts)_
<!-- commandsstop -->
