# @updraft/aws-static-site-https

# Features
**✓ HTTPs only** - S3 bucket is private  
**✓ SPA & Subfolder support** - Supports Single Page Apps & Hosting a static site via lambda edge (see `RoutingMode`)  
**✓ Route53 support** - Setup any Route53 (sub)domain to point to this site  
**✓ Local Sources** - Directly deploy your website from your local codebase

# Example
```typescript
import * as cdk from '@aws-cdk/core'
import { RoutingMode, StaticSiteHttps } from '@updraft/aws-static-site-https'

class StaticHtml extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props) {
    super(scope, id, props)
    new StaticSiteHttps(this, 'static-site', {
      domainName: 'example.com',
      localPathSiteAssets: './website',
      routingMode: RoutingMode.ENABLE_SUBFOLDERS,
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

# Install
1. If you want to use `RoutingMode.ENABLE_SUBFOLDERS` or `RoutingMode.SPA` a lambda edge function is setup, which requires that you bootstrap `us-east-1` for AWS CDK usage. (e.g. by running `npx cdk bootstrap aws://<AWS-ACCOUNT-ID>/us-east-1`)
2. `yarn add @updraft/aws-static-site-https`

# License
MIT
