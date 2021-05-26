import * as path from 'path'
import * as fs from 'fs'
import { Construct } from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as route53 from '@aws-cdk/aws-route53'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as targets from '@aws-cdk/aws-route53-targets/lib'
import * as lambda from '@aws-cdk/aws-lambda'

export interface StaticSiteHttpsProps {
  /**
   * Route53 domain to register the certificate & load balancer to.
   * 
   * @example
   * `example.com`
   */
  domainName: string,

  /**
   * Domain prefix to register the certificate & load balancer to.
   * 
   * @example
   * `development`
   * 
   * @defaultValue `undefined`
   */
  domainPrefix?: string,

  /**
   * S3 key to your static site's index document.
   * 
   * @defaultValue `index.html`
   */
  websiteIndexDocument?: string

  /**
   * S3 key to your static site's error document.
   * 
   * @defaultValue `error.html`
   */
  websiteErrorDocument?: string

  /**
   * Local file path to deploy your website's assets from.
   * Triggers a refresh (="invalidation") of Cloudfront distribution.
   * 
   * @defaultValue `undefined`
   */
  localPathSiteAssets?: string

  /**
   * Optionally sets up a lambda edge function to:
   * (1) Enable subfolders (translating example.com/about --> example.com/about/index.html)
   * (2) Enable Single Page App (SPA) (translating all subfolder requests to index.html doc)
   * 
   * Logs for lambda edge functions are written to the region that's closest to the caller.
   * Even though lambda edge functions are technically deployed in us-east-1, they're replicated
   * to each edge region - that's also why the logs are local!
   * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-testing-debugging.html#lambda-edge-testing-debugging-determine-region
   * 
   * @defaultValue LambdaEdgeMode.NONE
   */
  lambdaEdgeMode?: LambdaEdgeMode
}

export enum LambdaEdgeMode {
  ENABLE_SUBFOLDERS = 'ENABLE_SUBFOLDERS',
  SPA = 'SPA',
  NONE = 'NONE',
}

// TODO: Add tests
export class StaticSiteHttps extends Construct {
  constructor(parent: Construct, name: string, {
    domainName,
    domainPrefix = undefined,
    websiteIndexDocument = 'index.html',
    websiteErrorDocument = 'error.html',
    localPathSiteAssets = undefined,
    lambdaEdgeMode = LambdaEdgeMode.NONE,
  }: StaticSiteHttpsProps) {
    super(parent, name);

    const siteDomain = domainPrefix
      ? domainPrefix + '.' + domainName
      : domainName

    // Content bucket
    let siteBucket = new s3.Bucket(this, 'site-bucket', {
      bucketName: siteDomain,
    })

    // Prepare read access for cloudfront distribution
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'oai')
    siteBucket.grantRead(originAccessIdentity)

    // Create ACM certificate
    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName });
    const certificate = new acm.DnsValidatedCertificate(this, 'site-certificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1', // Has to be in us-east-1 for CloudFront distributions
    })

    // Create Lambda Edge function (if requested)
    let edgeFn = undefined
    if (lambdaEdgeMode === LambdaEdgeMode.ENABLE_SUBFOLDERS) {
      const edgeFnCode = fs.readFileSync(path.join(__dirname, 'lambda-edge', 'subfolders.js'), { encoding: 'utf-8' })
      edgeFn = new cloudfront.experimental.EdgeFunction(this, 'enable-subfolders-fn', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(edgeFnCode)
      })
    }

    if (lambdaEdgeMode === LambdaEdgeMode.SPA) {
      const edgeFnCode = fs.readFileSync(path.join(__dirname, 'lambda-edge', 'spa.js'), { encoding: 'utf-8' })
      edgeFn = new cloudfront.experimental.EdgeFunction(this, 'spa-fn', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(edgeFnCode)
      })
    }

    // Create cloudfront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'site-distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: siteBucket,
            originAccessIdentity,
          },
          behaviors : [{
            isDefaultBehavior: true,
            lambdaFunctionAssociations: (
              edgeFn
              ? [{
                eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                lambdaFunction: edgeFn?.currentVersion,
              }]
              : undefined
            ), 
          }],
        }
      ],
      defaultRootObject: websiteIndexDocument,
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [siteDomain],
      }),
      // Auto-create a bucket for logs
      loggingConfig: {},
    });

    // Create DNS entry
    new route53.ARecord(this, 'site-alias-record', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone
    });

    // Deploy site contents to S3 bucket
    if (localPathSiteAssets) {
      new s3deploy.BucketDeployment(this, 'deploy-with-invalidation', {
        sources: [s3deploy.Source.asset(localPathSiteAssets)],
        destinationBucket: siteBucket,
        distribution,
        distributionPaths: ['/*'],
      });
    }
  }
}