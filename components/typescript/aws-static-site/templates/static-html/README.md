# @updraft/aws-static-site - static-html
Easily deploy a static html website to AWS (including `https` setup through CloudFront and registration with your Route53 domain).

Run the below steps to get started, and then replace the contents of `/static-html` with whatever you like (e.g. the output of your favorite static site generator).

# Install this template
* Get the updraft CLI: `npm i -g @updraft/cli`
* Install this template: `updraft templates @updraft/aws-static-site static-html`

# Get started
* Setup the `env.sh` (see `template.env.sh` for instructions)
* Install dependencies: `yarn` / `npm install`
* Deploy to AWS: `yarn deploy` / `npm run deploy`
* Open up a browser and navigate to the DOMAIN you set in `env.sh`. You should see "Hello World"