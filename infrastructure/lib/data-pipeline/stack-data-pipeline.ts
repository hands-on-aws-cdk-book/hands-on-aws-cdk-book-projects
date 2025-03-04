import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_s3_notifications as s3n } from "aws-cdk-lib";
import { aws_sns as sns } from "aws-cdk-lib";
import * as path from "path";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";

/** Configuration for the energy data processing pipeline */
export interface DataPipelineStackProps extends cdk.StackProps {
  /** S3 bucket for raw CSV data uploads */
  readonly rawDataLandingBucket: s3.Bucket;
  /** SNS topic for new data upload notifications */
  readonly snsTopicRawUpload: sns.Topic;
  /** SNS topic for calculation result notifications */
  readonly snsTopicCalculatorSummary: sns.Topic;
  /** DynamoDB table for storing processed energy data */
  readonly calculatedEnergyTable: dynamodb.Table;
}

/** Creates a serverless pipeline for processing energy usage data */
export class DataPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: DataPipelineStackProps) {
    super(scope, id, props);

    /** JSON data storage with versioning enabled */
    const jsonTransformedBucket = new s3.Bucket(this, "JsonTransformedBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /** Transforms CSV files to normalized JSON format */
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
        },
        description: "Transforms CSV to JSON and saves to S3",
      }
    );

    /** Processes energy data and sends notifications */
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
          snsTopicCalculatorSummary: props.snsTopicCalculatorSummary.topicArn,
          CALCULATED_ENERGY_TABLE_NAME: props.calculatedEnergyTable.tableName,
          AWS_REGION: cdk.Stack.of(this).region,
        },
        description: "Calculates energy usage and sends notifications",
      }
    );

    // Set up permissions between components
    props.rawDataLandingBucket.grantRead(transformToJsonLambdaFunction);
    jsonTransformedBucket.grantWrite(transformToJsonLambdaFunction);
    jsonTransformedBucket.grantRead(calculateAndNotifyLambdaFunction);
    props.calculatedEnergyTable.grantWriteData(
      calculateAndNotifyLambdaFunction
    );

    // Wire up the event notifications
    props.rawDataLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(transformToJsonLambdaFunction),
      { suffix: ".csv" }
    );

    props.rawDataLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(props.snsTopicRawUpload),
      { suffix: ".csv" }
    );

    jsonTransformedBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(calculateAndNotifyLambdaFunction),
      { suffix: ".json" }
    );

    // Export bucket names for reference
    new cdk.CfnOutput(this, "RawDataLandingBucketName", {
      value: props.rawDataLandingBucket.bucketName,
      description: "S3 bucket for raw CSV data uploads",
    });

    new cdk.CfnOutput(this, "JsonTransformedBucketName", {
      value: jsonTransformedBucket.bucketName,
      description: "S3 bucket for transformed JSON data",
    });
  }
}
