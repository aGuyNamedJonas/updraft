#!/usr/bin/env node
import { Construct } from '@aws-cdk/core'
import * as Lambda from '@aws-cdk/aws-lambda'
import * as Apigateway from '@aws-cdk/aws-apigateway'
import * as Route53 from '@aws-cdk/aws-route53'
import * as Route53Target from '@aws-cdk/aws-route53-targets'
import * as CertificateManager from '@aws-cdk/aws-certificatemanager'

/**
 * @author Jonas Peeck <hi@aGuyNamedJonas.com>
 * @description
 * Easily setup an API Gateway with endpoints that are handled by lambdas.
 *
 * This can even include multiple lines, because that's how cool we are around here :)
 *
 * @feature Simple API schema
 * @featureDescription It's very straight forward to define your API - as it should be (but often isn't. Thanks API GW - jeez)
 *
 * @feature CORS Support
 * @featureDescription Just set the `CORS` flag for all endpoints that you want `options` handlers to be added for
 *
 * @optionalFeature Custom Domains
 * @featureDescription If you have a Route53 managed domain, simply setup a subdomain for this API (e.g. `api.example.com`)
 *
 * @example
 * new AwsApiGwMultiLambda(this, 'todo-api', {
 *   apiName: 'todos',
 *   apiDescription: 'API to manage todos',
 *   domainName: 'my-todos.com',
 *   apiDomainPrefix: 'api',
 *   apiConfig: [
 *     {
 *       resourceName: 'todos',
 *       integrations: [
 *         {
 *           // GET api.my-todos.com/todos
 *           // --> List of your tasks
 *           httpMethod: HTTP_METHODS.GET,
 *           // Using @updraft/aws-lambdas-multi-handler
 *           handler: taskLambdas.handlers['list']
 *         },{
 *           // PUT api.my-todos.com/todos
 *           // --> Create a new task
 *           httpMethod: HTTP_METHODS.PUT,
 *           // Using @updraft/aws-lambdas-multi-handler
 *           handler: taskLambdas.handlers['create']
 *         }
 *       ],
 *       children: [{
 *         resourceName: '{todoid}',
 *         integrations: [
 *           {
 *             // GET api.my-todos.com/todos/{todoid}
 *             // --> Get an individual task
 *             httpMethod: HTTP_METHODS.GET,
 *             // Using @updraft/aws-lambdas-multi-handler
 *             handler: taskLambdas.handlers['get']
 *           },{
 *             // PUT api.my-todos.com/todos/{todoid}
 *             // --> Update an individual task
 *             httpMethod: HTTP_METHODS.PUT,
 *             // Using @updraft/aws-lambdas-multi-handler
 *             handler: taskLambdas.handlers['update']
 *           },{
 *             // DELETE api.my-todos.com/todos/{todoid}
 *             // --> Delete an individual task
 *             httpMethod: HTTP_METHODS.DELETE,
 *             // Using @updraft/aws-lambdas-multi-handler
 *             handler: taskLambdas.handlers['delete']
 *           }
 *         ],
 *         enableCors: true
 *       }],
 *       enableCors: true
 *     },
 *   ]
 * })
 */

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
