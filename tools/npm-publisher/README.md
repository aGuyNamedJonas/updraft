# NPM Publisher
This tool is triggered on every new commit to `master`, republishing all `/modules/typescript` modules to `NPM` if they had a version upgrade in the current commit.  

Version upgrades are detected by observing git diffs to `package.json` files in `/modules/typescript`.

## Install
`npm install`

## Run
`NPM_TOKEN=<insert npm token> && node ./`
