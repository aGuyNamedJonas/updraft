# @updraft/aws-static-site
> Available Quickstart-Templates (scroll down for instructions 👇🏾)  
**static-html**  

Easily setup a static site on AWS under your own domain.

Uses your local code, so you don't have to upload into a bucket prior to deploying changes.

Does currently not support Single Page Applications (SPA). [WIP]

## Features
**✓ Custom Domain** - Setup any Route53 managed domain to point to this website  
**✓ Invalidates on Redeploy** - When you run `npm deploy` with this module, your local source files for your website are automatically re-uploaded, and a CloudFront invalidation is triggered.  
**✓ Local Sources** - Uses local sources, so you can directly deploy your website from your local codebase  
**✓ Subdomain Support** (optional) - You can optionally specify a subdomain (e.g. If you want to setup a static image host)  

## Install
`npm install --save @updraft/aws-static-site`

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

## Templates
| Template Name | Install | Description |
|---------------|---------|-------------|
| static-html | `updraft templates  static-html` | Static HTML quickstart-template - perfect for use with static site generators (e.g. Hugo, Nuxt, Next, Gridsome,...) |

Quick Start templates for *updraft* components provide you with runnable examples.    
So Instead of having to copy'n'paste example code, you can instead get a runnable example setup, and just start hacking away 🙌🏻  

(Run `npm i -g @updraft/cli` if you don't have the CLI yet)