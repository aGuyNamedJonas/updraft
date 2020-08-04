# Typescript Modules
Typescript modules are automatically published to the `@updraft` scope on NPM whenever a commit to the `master` branch is made.

## Regenerate documentation for all components
* Upgrade patch version of all components  
`for d in ./*/ ; do (cd "$d" && npm version patch); done`
* Regenerate documentation  
`updraft docs`