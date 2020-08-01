import * as cdk from '@aws-cdk/core'
import StaticSite from '@updraft/aws-static-site'

const { AWS_ACCOUNT_ID, AWS_REGION, DOMAIN } = process.env
if (!AWS_ACCOUNT_ID || !AWS_REGION || !DOMAIN) {
  throw new Error('AWS_ACCOUNT_ID, AWS_REGION, and DOMAIN need to be set, please see template.env.sh for details.')
}

class StaticHtml extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: any = {}) {
    super(scope, id, props)
    new StaticSite(this, 'static-site', {
      domainName: DOMAIN as string,
      region: AWS_REGION as string,
      siteContent: './website',
    })
  }
}

const cdkApp = new cdk.App()
new StaticHtml(cdkApp, 'my-static-page', {
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION
  }
})