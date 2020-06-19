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
@updraft/cli/0.0.0 darwin-x64 node-v14.3.0
$ updraft --help [COMMAND]
USAGE
  $ updraft COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`updraft hello [FILE]`](#updraft-hello-file)
* [`updraft help [COMMAND]`](#updraft-help-command)

## `updraft hello [FILE]`

describe the command here

```
USAGE
  $ updraft hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ updraft hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/aGuyNamedJonas/updraft/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
