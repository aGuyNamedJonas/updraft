import * as cdk from '@aws-cdk/core'
import { Duration } from '@aws-cdk/core'
import * as Apigateway from '@aws-cdk/aws-apigateway'
import { Queue } from '@aws-cdk/aws-sqs'
import * as iam from '@aws-cdk/aws-iam'
import * as Lambda from '@aws-cdk/aws-lambda'
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources'

export interface AwsApiGwSqsLambdaProps {
  /**
   * The visibility timeout to be configured on the SQS Queue, in seconds.
   *
   * @default Duration.seconds(300)
   */
  visibilityTimeout?: cdk.Duration;
}

export class AwsApiGwSqsLambda extends cdk.Construct {
  public api: Apigateway.RestApi
  public queue: Queue
  public lambda: Lambda.Function

  private apiGwRole: iam.Role
  private lambdaRole: iam.Role

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // In 48h nochmal probieren wenn der DNS Change propagated ist!
    // new AwsStaticSite(this, 'website', {
    //   domainName: 'axelspringertech.com',
    //   siteContent: './site-content'
    // })

    this.createApi('webhook-processor', 'API that will process incoming events from Slack / Microsoft Teams for further processing')
    this.createQueue()
    this.createLambda('../src/')

    this.createApiGwRole()
    this.setupApiSqsIntegration()
    this.setupSqsLambdaIntegration()
  }

  createApiGwRole () {
    this.apiGwRole = new iam.Role(this, 'api-gw-role', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    })
  }

  createQueue () {
    this.queue = new Queue(this, 'webhook-events', {
      queueName: 'webhook-events'
    })
    new cdk.CfnOutput(this, 'SQS', { value: this.queue.queueUrl });
  }

  createApi (apiName: string, apiDescription?: string) {
    this.api = new Apigateway.RestApi(this, 'api', {
      restApiName: apiName,
      description: apiDescription,
      endpointTypes: [ Apigateway.EndpointType.EDGE ],
    })
    new cdk.CfnOutput(this, 'API Gateway', { value: this.api.url });
  }

  setupApiSqsIntegration () {
    const apiSqsIntegration = new Apigateway.AwsIntegration({
      service: 'sqs',
      path: `${cdk.Aws.ACCOUNT_ID}/${this.queue.queueName}`,
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: this.apiGwRole,
        passthroughBehavior: Apigateway.PassthroughBehavior.NEVER,
        requestParameters: {
          'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'"
        },
        requestTemplates: {
          'application/json': 'Action=SendMessage&MessageBody=$util.urlEncode(\"{ params: $input.params(), payload: $input.body }\")'
        },
        integrationResponses: [
          {
            statusCode: '200',
          },
          {
            statusCode: '500',
            responseTemplates: {
              'text/html': 'Uh oh - that did not work. Try again!'
            },
            selectionPattern: '500'
          }
        ]
      }
    })

    const eventSourceResource = this.api.root.addResource('{eventSource}')
    eventSourceResource.addMethod('POST', apiSqsIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true
          },
        },
        {
          statusCode: "500",
          responseParameters: {
            "method.response.header.Content-Type": true
          },
        }
      ]
    })

    this.apiGwRole.addToPolicy(new iam.PolicyStatement({
      resources: [ this.queue.queueArn ],
      actions: [ 'sqs:SendMessage' ]
    }))
  }

  createLambda (localCodePath: string, runtime = Lambda.Runtime.NODEJS_12_X, timeoutSec = 3, handlerName = 'handler') {
    const lambdaRole = new iam.Role(this, 'lambda-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        LambdaFunctionServiceRolePolicy: new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            actions: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents'
            ],
            resources: [`arn:aws:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/aws/lambda/*`]
          })]
        })
      }
    })
    this.lambdaRole = lambdaRole

    this.lambda = new Lambda.Function(this, 'webhook-processor-lambda', {
      role: lambdaRole,
      runtime,
      timeout: Duration.seconds(timeoutSec),
      handler: `index.${handlerName}`,
      code: Lambda.Code.asset(localCodePath),
      // This enforces updates on redeploy
      description: `Version: ${new Date().toISOString()}`
    })
  }

  setupSqsLambdaIntegration () {
    this.lambda.addEventSource(new SqsEventSource(this.queue));
  }
}
