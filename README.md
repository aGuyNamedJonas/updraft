<p align="center">
  <img src="https://raw.githubusercontent.com/aGuyNamedJonas/updraft/master/design/updraft-logo-text-color.svg" alt="Sublime's custom image"/>
</p>

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

> An open collection of cloud-infrastructure components (powered by CDK)  

*updraft* is a CLI and an open collection of *CDK components* (or "constructs" as AWS refers to them) that makes it easy for any developer to build their own cloud-infrastructure.  

We want to bring the power of *components based development* to the world of cloud-infrastructure.

Think of *updraft* components like *react components* - just for building infrastructure, instead of UIs.

## Example
```typescript
import * as cdk from '@aws-cdk/core'
import StaticSite from '@updraft/aws-static-site'

class StaticHtml extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props) {
    super(scope, id, props)
    new StaticSite(this, 'static-site', {
      domainName: 'example.com',
      region: 'eu-central-1',
      siteContent: './website',
    })
  }
}

const cdkApp = new cdk.App()
new StaticHtml(cdkApp, 'my-static-page', {
  env: {
    account: '1234567890',
    region: 'eu-central-1'
  }
})
```

👉🏿 `StaticSite` only needs to know the Route53 registered domain to use, the region you want to deploy to, and the local path to your html (which will be uploaded automatically).

All the annoying stuff (setting up the S3 bucket, setting up the CloudFront distribution for HTTPs and registering a certificate with ACM) is taken care of by `@updraft/aws-static-site`.

👇🏻 See below to get started with that example

## Getting started in 2 minutes
Examples are great. Quick-start templates are even better.  

Here's how you can setup your own static-website (with HTTPs and domain registration) in **2 minutes** with the `static-html` quick-start template for the `@updraft/aws-static-site` component:

```bash
# Install the updraft cli
npm i -g updraft
# Install the "static-html" template
updraft templates @updraft/aws-static-site static-html
# Go into the newly created folder
cd ./static-html
# Setup the AWS account ID, region, and the Route53 domain to use in env.sh
cp ./template.env.sh env.sh
# Install & deploy
npm install && source ./env.sh && npm run deploy
```

Once deployment is done (deployment takes longer than 2 minutes), open up your browser and navigate to the domain you specified in `env.sh`.  

You should be greeted by a friendly "Hello World".

## Why? [![start with why](https://img.shields.io/badge/start%20with-why%3F-brightgreen.svg?style=flat)](http://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action)

We build *updraft* to empower every developer around the world to run their apps on highly scalable cloud-infrastructure with ease.  

We believe in the power of building complex things by plugging together easy to use components.  

Our hope is that updraft can do both - help people worldwide bring their ideas to a global audience, and popularize a simpler, components-centric approach to building cloud-infrastructure.

👉🏿 Read more: [Vision, Values, Mission](/docs/VisionValuesMission.md)

## Contribute
Recently built something with CDK that you're really proud of?  
Have a great idea for an awesome reusable *updraft* component?  

👉🏾 Check out our [contribution guide](./CONTRIBUTING.md)

## License
