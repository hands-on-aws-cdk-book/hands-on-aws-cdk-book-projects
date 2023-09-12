import { Duration } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Integer } from "aws-sdk/clients/apigateway";
import { aws_sqs as sqs } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";

interface HecLambdaProps {
  /**
   * Required: name of lambda function
   */
  readonly lambdaName?: string;

  /**
   * Optional: set concurrency limit
   * @default 100
   */
  readonly concurrencyLimit?: Integer;

  /**
   * Optional: set timeout minutes
   * @default 15
   */
  readonly timeout?: Duration;

  /**
   * Required: set lambda runtime
   */
  readonly runtime: lambda.Runtime;

  /**
   * Optional: set a specific role for the lambda function
   * @default undefined
   */
  readonly role?: IRole;

  /**
   * Optional: set a description for the lambda function
   * @default undefined
   */
  readonly description?: string;

  /**
   * Optional: set handler name -- default is "main.handler"
   */
  readonly handler: string;

  /**
   * Optional: set handler directory path -- default is './lambda'
   * @default "./lambda"
   */
  readonly code: lambda.Code;

  /**
   * Optional: set handler directory path -- default is './lambda'
   * @default undefined
   */
  readonly layers?: Array<lambda.ILayerVersion>;

  /**
   * Optional: set environmental variables (always encrypted by default)
   * @default undefined
   */
  readonly environment?: Record<string, string>;
}

/**
 * This construct provides a pre-configured default Node Lambda Function.
 * This pre-configured default meets cdk_nag AWS specifications
 * for security and well-architected infrastructure.
 */

export class HecNodeLambdaConstruct extends lambda.Function {
  /**
   * S3 bucket object to be passed to other functions
   */
  public readonly lambdaFunction: lambda.Function;
  public readonly lambdaDlq: sqs.Queue;

  /**
   * Creates a Node Lambda Function that enables cdk_nag compliance through defaults
   * This Lambda Function includes a FIFO dead letter queue,
   * X-Ray tracing enabled by default, and x86 architecture
   * to utilize Graviton2 instances and improve performance
   * and reduce electricity consumption.
   * @param scope
   * @param id
   * @param HecLambdaProps
   */
  constructor(scope: Construct, id: string, props: HecLambdaProps) {
    super(scope, id, {
      ...props,
      /**
       * Creates a Node Lambda Function with FIFO dead letter queue, x86 architecture,
       * and X-ray tracing.
       */
      runtime: props.runtime,
      code: props.code,
      handler: props.handler,
      layers: props.layers,
      description: props.description,
      role: props.role,
      timeout: props.timeout ? props.timeout : Duration.minutes(5),
      environment: props.environment || undefined,
      architecture: lambda.Architecture.X86_64, // specify graviton2 based lambda architecture
      deadLetterQueueEnabled: true, // enable FIFO dead letter queue
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        queueName: `${id}dlq.fifo`,
        deliveryDelay: Duration.millis(0),
        contentBasedDeduplication: true,
        enforceSSL: true,
        retentionPeriod: Duration.days(14),
      }),
      tracing: lambda.Tracing.ACTIVE, // enable x-ray tracing for all functions
    });
  }
}
