@updraft/cli
============

Get quickstart templates for updraft moudles, initialize your own updraft module, or check your module before submitting it as a PR.

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
@updraft/cli/0.0.17 linux-x64 node-v14.7.0
$ updraft --help [COMMAND]
USAGE
  $ updraft COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`updraft docs [DIFF-CMD]`](#updraft-docs-diff-cmd)
* [`updraft help [COMMAND]`](#updraft-help-command)
* [`updraft init`](#updraft-init)
* [`updraft publish [DIFF-CMD]`](#updraft-publish-diff-cmd)
* [`updraft templates MODULE [TEMPLATE] [PATH]`](#updraft-templates-module-template-path)

## `updraft docs [DIFF-CMD]`

Auto-Generates the README and some package.json fields for your updraft component by parsing the tsdoc in your index.ts

```
USAGE
  $ updraft docs [DIFF-CMD]

ARGUMENTS
  DIFF-CMD  Git command to use to detect changes

OPTIONS
  -h, --help                                   show CLI help

  --auto-commit                                Create a commit with the auto-generated README.md and package.json
                                               (default: false)

  --exclude=exclude                            Glob pattern specifying which files to exclude from consideration for
                                               publish & docs (default to "")

  --include=include                            Glob pattern specifying which files to consider for publish & docs
                                               (default "./package.json")

  --packagejson-template=packagejson-template  Relative path to the package.json.handlebars template file to use
                                               (default: "package.json.handlebars")

  --readme-template=readme-template            Relative path to the README.md.handlebars template file to use (default:
                                               "README.md.handlebars")

  --verbose                                    Enable verbose output (=debug output)

DESCRIPTION
  Auto-generated READMEs allow us to optimize the user-experience around the overall updraft project as a whole, while 
  you can focus on optimizing the user experience of your own updraft modules.

  Run "$ updraft init to download the latest example on how to use the tsdoc fields.

EXAMPLE
  $ updraft doc
  Takes the tsdoc from your index.ts and turns it into a README and some package.json fields
```

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

Start creating a new updraft component (either for submission to updraft or your own library.

```
USAGE
  $ updraft init

DESCRIPTION
  Alias for updraft templates @updraft/templates

EXAMPLE
  $ updraft init
  Shows you a list of templates that you can use to initialize a new updraft component.
```

## `updraft publish [DIFF-CMD]`

Publish all changed node modules for which the package.json was modified

```
USAGE
  $ updraft publish [DIFF-CMD]

ARGUMENTS
  DIFF-CMD  Git command to use to detect changes

OPTIONS
  -h, --help         show CLI help
  --dry-run          Only check for packages to re-publish, do not actually publish to NPM (default false)

  --exclude=exclude  Glob pattern specifying which files to exclude from consideration for publish & docs (default to
                     "")

  --include=include  Glob pattern specifying which files to consider for publish & docs (default "./package.json")

  --public-access    Run the npm publish with the "--access public" flag (default false)

  --skip-npm-auth    Set this flag to skip NPM authentication (e.g. when using a custom .npmrc or using npm login)
                     (default false)

  --verbose          Enable verbose output (=debug output)

DESCRIPTION
  You only need to use this, if you're planning to use updraft to manage your internal CDK component library. Check out 
  the updraft build scripts for inspiration how we use this command to publish to the public @updraft component library 
  on NPM.

EXAMPLES
  $ export NPM_TOKEN=<Your NPM token> && updraft publish --include="./*/package.json" --exclude=""./templates/**""
  We run this command on changes to the master-branch from inside /modules/typescript to re-publish all changed modules 
  (but not their templates). We set these values in /modules/typescript/updraft.json though.

  $ export NPM_TOKEN=<Your NPM token> && updraft publish --include="package.json" "diff origin/master..."
  Publish the module in the current folder, if its package.json file was changed compared to the master branch.

  $ updraft publish --include="package.json" --skip-npm-auth "diff origin/master..."
  Publishthe module in the current folder, if its package.json file was changed compared to the master branch and use 
  whatever authentication you setup for NPM (e.g. with npm login).
```

## `updraft templates MODULE [TEMPLATE] [PATH]`

Get up & running with templates - runnable examples for updraft modules, installed directly into your codebase.

```
USAGE
  $ updraft templates MODULE [TEMPLATE] [PATH]

ARGUMENTS
  MODULE    Updraft component from which to get the template from (needs to include scope - e.g.
            @updraft/aws-static-site)

  TEMPLATE  Name of the template to download (will be prompted if not provided)

  PATH      Local path to install the template to (default ".")

OPTIONS
  -h, --help  show CLI help
  --verbose   Enable verbose output (=debug output)

EXAMPLES
  $ updraft templates @updraft
  Get a list of templates to get started with building your own custom @updraft components.

  $ updraft templates @updraft/aws-static-site
  Opens an interactive prompt, letting you choose which template to download for the @updraft/aws-static-site component.

  $ updraft templates @updraft/aws-lambdas-multi-handler echo .
  Installs the "echo" example into your current folder without prompting.
```
<!-- commandsstop -->
