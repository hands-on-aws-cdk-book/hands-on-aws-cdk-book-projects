/**
 * This stack does the following:
 * 1. Upload raw data to S3
 * 2. Trigger notification
 * 3. Transform CSV to JSON
 * 4. Save to bucket
 * 5. Trigger calculator
 * 6. Send notification
 */

/**
 * Import various modules from AWS CDK and nodejs core libraries
 */
import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_s3_notifications as s3n } from "aws-cdk-lib";
// <-- NEW CODE STARTS HERE -->
import { aws_sns as sns } from "aws-cdk-lib";
// <-- NEW CODE ENDS HERE -->
import * as path from "path";

// <-- NEW CODE STARTS HERE -->
export interface DataPipelineStackProps {
  /**
   * Required: S3 bucket for raw data upload
   */
  readonly rawDataLandingBucket: s3.Bucket;

  /**
   * Required: notification topic
   */
  readonly snsTopicRawUpload: sns.Topic;

  /**
   * Required: notification topic
   */
  readonly snsTopicCalculatorSummary: sns.Topic;
}
// <-- NEW CODE ENDS HERE -->

/**
 * The stack class extends the base CDK Stack
 */
// <-- NEW CODE STARTS HERE -->
export class DataPipelineStack extends cdk.Stack {
  /**
   * Constructor for the stack
   * @param {cdk.App} scope - The CDK application scope
   * @param {string} id - Stack ID
   * @param {DataPipelineStackProps} props - Data pipeline stack properties
   */
  constructor(scope: cdk.App, id: string, props: DataPipelineStackProps) {
    // Call super constructor
    super(scope, id, props);

    // <-- NEW CODE ENDS HERE -->
    // Create S3 bucket to store transformed JSON
    const jsonTransformedBucket = new s3.Bucket("JsonTransformedBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda function to generate greeting
    const transformToJsonLambdaFunction = new lambda.Function(
      this,
      "TransformToJsonLambdaFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.main",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "./lambda/lambda-transform-to-json")
        ),
        environment: {
          transformedToJsonBucket: jsonTransformedBucket.bucketName,
          AWS_REGION: cdk.Stack.of(this).region,
        },
        description:
          "Lambda function transforms CSV to JSON and saves to S3 bucket",
      }
    );

    // Create Lambda function to generate greeting
    const calculateAndNotifyLambdaFunction = new lambda.Function(
      this,
      "CalculateAndNotifyLambdaFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.main",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "./lambda/lambda-calculate-notify")
        ),
        environment: {
          snsTopicCalculatorSummary: jsonTransformedBucket.bucketName,
          AWS_REGION: cdk.Stack.of(this).region,
        },
        description:
          "Lambda function transforms CSV to JSON and saves to S3 bucket",
      }
    );

    // Grant helloCdkLambdaFunction read access to helloCdkS3Bucket
    props.rawDataLandingBucket.grantRead(transformToJsonLambdaFunction);

    // Grant helloCdkLambdaFunction read access to helloCdkS3Bucket
    jsonTransformedBucket.grantWrite(transformToJsonLambdaFunction);

    // Grant helloCdkLambdaFunction read access to helloCdkS3Bucket
    jsonTransformedBucket.grantRead(calculateAndNotifyLambdaFunction);

    props.rawDataLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsNotification(props.snsTopicRawUpload, {
        suffix: ".csv",
      })
    );

    // Invoke lambda when new object created in S3 bucket
    props.rawDataLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(calculateAndNotifyLambdaFunction),
      { suffix: ".json" }
    );

    // Output S3 bucket name
    new cdk.CfnOutput(this, "RawDataLandingBucketName", {
      value: props.rawDataLandingBucket.bucketName,
    });

    // Output S3 bucket name
    new cdk.CfnOutput(this, "JsonTransformedBucketName", {
      value: jsonTransformedBucket.bucketName,
    });
    // <-- NEW CODE ENDS HERE -->
  }
}
