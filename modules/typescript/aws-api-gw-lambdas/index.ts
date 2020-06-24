#!/usr/bin/env node
import { Construct } from '@aws-cdk/core'
import * as Lambda from '@aws-cdk/aws-lambda'
import * as Apigateway from '@aws-cdk/aws-apigateway'
import * as Route53 from '@aws-cdk/aws-route53'
import * as Route53Target from '@aws-cdk/aws-route53-targets'
import * as CertificateManager from '@aws-cdk/aws-certificatemanager'

export enum HTTP_METHODS {
  ANY = 'ANY',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export type LambdaIntegration = {
  httpMethod: HTTP_METHODS,
  handler: Lambda.Function,
}

export type ApiResourceConfig = {
  resourceName: string,
  integrations: LambdaIntegration[]
  enableCors: boolean,
  children?: ApiResourceConfig[]
}

export type AwsApiGatewayMultiLambdaProps = {
  apiName: string,
  apiDescription?: string
  apiConfig: ApiResourceConfig[]

  domainName?: string
  apiDomainPrefix?: string
  basePath?: string
}

export class AwsApiGwMultiLambda extends Construct {
  api: Apigateway.RestApi

  constructor(parent: Construct, name: string, props: AwsApiGatewayMultiLambdaProps) {
    super(parent, name)
    this.createApi(props.apiName, props.apiDescription)
    this.createApiResources(this.api.root, props.apiConfig)
    if (props.domainName) {
      this.createDomainMapping(props.domainName, props.apiDomainPrefix, props.basePath)
    }
  }

  createApi (apiName: string, apiDescription?: string) {
    this.api = new Apigateway.RestApi(this, 'api', {
      restApiName: apiName,
      description: apiDescription,
    })
  }

  createApiResources (parentResource: Apigateway.IResource, apiConfig: ApiResourceConfig[]) {
    apiConfig.forEach(({ resourceName, integrations, enableCors, children }) => {
      const resource = parentResource.addResource(resourceName)
      this.createApiIntegrations(resource, integrations)

      if (enableCors) {
        addCorsOptions(resource)
      }

      if (children) {
        this.createApiResources(resource, children)
      }
    })
  }

  createApiIntegrations (parentResource: Apigateway.IResource, integrations: LambdaIntegration[]) {
    integrations.forEach(({ httpMethod, handler }) => {
      const lambdaIntegration = new Apigateway.LambdaIntegration(handler)
      parentResource.addMethod(httpMethod, lambdaIntegration)
    })
  }

  createDomainMapping (domainName: string, apiDomainPrefix: string = '', basePath: string = '') {
    const apiDomain = apiDomainPrefix + '.' + domainName
    const zone = Route53.HostedZone.fromLookup(this, 'Zone', { domainName })
    const certificate = new CertificateManager.DnsValidatedCertificate(this, 'SiteCertificate', {
      region: 'us-east-1',
      domainName: apiDomain,
      hostedZone: zone
    })

    const apiGwDomain = new Apigateway.DomainName(this, 'api-gw-domain', {
      certificate,
      domainName: apiDomain,
      endpointType: Apigateway.EndpointType.EDGE
    })
    apiGwDomain.addBasePathMapping(this.api, { basePath })

    new Route53.ARecord(this, 'api-gw-domain-alias', {
      recordName: apiDomain,
      zone: zone,
      target: Route53.RecordTarget.fromAlias(new Route53Target.ApiGatewayDomain(apiGwDomain))
    })
  }
}

export function addCorsOptions(apiResource: Apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new Apigateway.MockIntegration({
      integrationResponses: [{
      statusCode: '200',
      responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'false'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
      }],
      passthroughBehavior: Apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
      },
  }), {
      methodResponses: [{
      statusCode: '200',
      responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
          'method.response.header.Access-Control-Allow-Origin': true,
      },
      }]
  })
}
