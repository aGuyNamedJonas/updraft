#!/usr/bin/env node
import cloudfront = require('@aws-cdk/aws-cloudfront');
import route53 = require('@aws-cdk/aws-route53');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import acm = require('@aws-cdk/aws-certificatemanager');
import cdk = require('@aws-cdk/core');
import targets = require('@aws-cdk/aws-route53-targets/lib');
import { Construct } from '@aws-cdk/core';
import { OriginProtocolPolicy } from '@aws-cdk/aws-cloudfront';

/**
 * @author Jonas Peeck <hi@aGuyNamedJonas.com> (https://aGuyNamedJonas.com)
 * @headline
 * Easily setup a static site on AWS under your own domain
 * @description
 * Easily setup a static site on AWS under your own domain.
 *
 * Uses your local code, so you don't have to upload into a bucket prior to deploying changes.  
 * 
 * Does currently not support Single Page Applications (SPA). [WIP]
 *
 * @feature Custom Domain
 * @featureDescription Setup any Route53 managed domain to point to this website
 *
 * @feature Invalidates on Redeploy
 * @featureDescription When you run `npm deploy` with this module, your local source files for your website are automatically re-uploaded, and a CloudFront invalidation is triggered.
 *
 * @feature Local Sources
 * @featureDescription Uses local sources, so you can directly deploy your website from your local codebase
 *
 * @optionalFeature Subdomain Support
 * @featureDescription You can optionally specify a subdomain (e.g. If you want to setup a static image host)
 *
 *
 * @example
 * ```typescript
 * import * as cdk from '@aws-cdk/core'
 * import StaticSite from '@updraft/aws-static-site'
 * 
 * class StaticHtml extends cdk.Stack {
 *   constructor(scope: cdk.Construct, id: string, props) {
 *     super(scope, id, props)
 *     new StaticSite(this, 'static-site', {
 *       domainName: 'example.com',
 *       region: 'eu-central-1',
 *       siteContent: './website',
 *     })
 *   }
 * }
 *
 * const cdkApp = new cdk.App()
 * new StaticHtml(cdkApp, 'my-static-page', {
 *   env: {
 *     account: '1234567890',
 *     region: 'eu-central-1'
 *   }
 * })
 *```
 */

export interface AwsStaticSiteProps {
  domainName: string;
  region: string;
  siteContent?: string;
  siteSubDomain?: string;
}

class AwsStaticSite extends Construct {
  constructor(parent: Construct, name: string, props: AwsStaticSiteProps) {
      super(parent, name);

      const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.domainName });
      const siteDomain = props.siteSubDomain
                          ? props.siteSubDomain + '.' + props.domainName
                          : props.domainName

      new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

      // Content bucket
      const siteBucket = new s3.Bucket(this, 'SiteBucket', {
          bucketName: siteDomain,
          websiteIndexDocument: 'index.html',
          websiteErrorDocument: 'error.html',
          publicReadAccess: true,

          // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
          // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
          // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
          removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
      });
      new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

      // TLS certificate
      const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
          region: 'us-east-1',
          domainName: siteDomain,
          hostedZone: zone
      }).certificateArn;
      new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });

      // CloudFront distribution that provides HTTPS
      const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
          aliasConfiguration: {
              acmCertRef: certificateArn,
              names: [ siteDomain ],
              sslMethod: cloudfront.SSLMethod.SNI,
              securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
          },
          originConfigs: [
              {
                  /**
                   * Alright, so this is an interesting one: When I used S3 as an origin and added a index.html to a subfolder (e.g. example.com/about)
                   * I got an "access denied" error.
                   *
                   * The workaround I found quite a bit, is to actually add the S3 website URL, instead of just the S3 bucket, as the origin to CloudFront.
                   * This workaround actually does work, when entering the URL manually in the CloudFront UI, so I'm also adding it here.
                   * Can be changed in the future if we find a better solution.
                   *
                   * The AWS documentation on using S3 buckets as origins for CloudFront distributions tell us
                   * that in order to use the S3-website URL we need to use a CustomOriginConfig:
                   *
                   * "Note: If you use the CloudFront API to create your distribution with an Amazon S3 bucket that is configured as a website endpoint, you must configure it by using CustomOriginConfig, even though the website is hosted in an Amazon S3 bucket. For more information about creating distributions by using the CloudFront API, see CreateDistribution in the Amazon CloudFront API Reference."
                   * https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html
                   */
                  customOriginSource: {
                    domainName: `${siteDomain}.s3-website.${props.region}.amazonaws.com`,
                    originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
                  },
                  behaviors : [ {isDefaultBehavior: true}],
              }
          ]
      });
      new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

      // Route53 alias record for the CloudFront distribution
      new route53.ARecord(this, 'SiteAliasRecord', {
          recordName: siteDomain,
          target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
          zone
      });

      // Deploy site contents to S3 bucket
      if (props.siteContent) {
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
          sources: [ s3deploy.Source.asset(props.siteContent) ],
          destinationBucket: siteBucket,
          distribution,
          distributionPaths: ['/*'],
        });
      }
  }
}

export default AwsStaticSite
