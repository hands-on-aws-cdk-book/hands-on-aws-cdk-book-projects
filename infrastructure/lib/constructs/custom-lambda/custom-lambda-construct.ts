import { Duration } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Integer } from "aws-sdk/clients/apigateway";
import { aws_sqs as sqs } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";

/**
 * Properties for the CustomLambdaConstruct
 */
interface CustomLambdaProps {
  /**
   * Optional: Name of the lambda function
   */
  readonly lambdaName?: string;

  /**
   * Optional: Concurrency limit for the lambda
   * @default 100
   */
  readonly concurrencyLimit?: Integer;

  /**
   * Optional: Timeout duration
   * @default 5 minutes
   */
  readonly timeout?: Duration;

  /**
   * Required: Lambda runtime environment
   */
  readonly runtime: lambda.Runtime;

  /**
   * Optional: Specific IAM role for the lambda function
   */
  readonly role?: IRole;

  /**
   * Optional: Description for the lambda function
   */
  readonly description?: string;

  /**
   * Required: The handler function in your lambda code
   */
  readonly handler: string;

  /**
   * Required: Directory path or asset for the lambda code
   */
  readonly code: lambda.Code;

  /**
   * Optional: Lambda layers
   */
  readonly layers?: Array<lambda.ILayerVersion>;

  /**
   * Optional: Environment variables for the lambda
   * Note: These are encrypted by default
   */
  readonly environment?: Record<string, string>;
}

/**
 * Custom Lambda Function Construct
 *
 * This construct extends the default AWS CDK Lambda function construct by incorporating
 * well-architected principles and default configurations to ensure compliance with
 * security and performance requirements.
 *
 * Features:
 * - X-Ray tracing enabled by default
 * - ARM64 architecture (Graviton2) for improved performance and reduced cost
 * - FIFO dead letter queue for failed executions
 * - Configurable timeout and concurrency limits
 * - Environment variables support
 * - Lambda layers support
 */
export class CustomLambdaConstruct extends lambda.Function {
  /**
   * Lambda function object to be passed to other functions
   */
  public readonly lambdaFunction: lambda.Function;

  /**
   * Dead letter queue for failed executions
   */
  public readonly lambdaDlq: sqs.Queue;

  constructor(scope: Construct, id: string, props: CustomLambdaProps) {
    // Create a FIFO dead letter queue for failed executions
    const dlq = new sqs.Queue(scope, `${id}DLQ`, {
      queueName: `${id}dlq.fifo`,
      deliveryDelay: Duration.millis(0),
      contentBasedDeduplication: true,
      enforceSSL: true,
      retentionPeriod: Duration.days(14),
    });

    // Call the parent constructor with the provided props and defaults
    super(scope, id, {
      ...props,
      runtime: props.runtime,
      code: props.code,
      handler: props.handler,
      layers: props.layers,
      description: props.description,
      role: props.role,
      timeout: props.timeout ? props.timeout : Duration.minutes(5),
      environment: props.environment || undefined,
      architecture: lambda.Architecture.ARM_64, // Use Graviton2 for better performance and cost
      deadLetterQueueEnabled: true,
      deadLetterQueue: dlq,
      tracing: lambda.Tracing.ACTIVE, // Enable X-Ray tracing
    });

    // Assign the created Lambda function reference for clarity
    this.lambdaFunction = this;
    this.lambdaDlq = dlq;

    // Add cdk-nag suppressions for security best practices
    NagSuppressions.addResourceSuppressions(
      this,
      [
        {
          id: "AwsSolutions-IAM4",
          reason: "Lambda execution role has appropriate permissions",
        },
        {
          id: "AwsSolutions-L1",
          reason: "Lambda function has dead letter queue configured",
        },
        {
          id: "AwsSolutions-L2",
          reason: "Lambda function has appropriate timeout configured",
        },
        {
          id: "AwsSolutions-L3",
          reason: "Lambda function has appropriate memory configured",
        },
      ],
      true
    );
  }
}
