# @updraft/aws-static-site
Easily setup a static site on AWS under your own domain.

Uses your local code, so you don't have to upload into a bucket prior to deploying changes.
TODO: Add SPA support

## Features
**✓ Custom Domain** - Setup any Route53 managed domain to point to this website  
**✓ Invalidates on Redeploy** - When you run `npm deploy` with this module, your local source files for your website are automatically re-uploaded, and a CloudFront invalidation is triggered.  
**✓ Local Sources** - Uses local sources, so you can directly deploy your website from your local codebase  
**✓ Subdomain Support** (optional) - You can optionally specify a subdomain (e.g. If you want to setup a static image host)  

## Install
`npm install --save @updraft/aws-static-site`

## Example
```typescript
  // Setup a regular website
  new AwsStaticSite(this, 'my-awesome-website', {
    domainName: 'example.com',
    siteContent: './default-website'
  })

  // Setup a static host - e.g. for images, user uploads etc.
  new AwsStaticSite(this, 'my-static-host', {
    domainName: 'example.com',
    siteSubDomain: 'static',
    // In that case you can still define an index and a 404 handler
    siteContent: './default-website'
  })
```

## Templates
To see the available quickstart-templates for this module:
- Install the *updraft* cli:  
`npm install --global @updraft/cli`
- Run the `templates` command:  
`updraft templates @updraft/aws-static-site`
