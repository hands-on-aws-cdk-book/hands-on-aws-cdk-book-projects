import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_s3_notifications as s3n } from "aws-cdk-lib";
import { aws_sns as sns } from "aws-cdk-lib";
import { aws_sns_subscriptions as subscriptions } from "aws-cdk-lib";
import * as path from "path";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { SharedResourcesStack } from "../shared-resources/stack-shared-resources";

/** Configuration for the energy data processing pipeline */
export interface DataPipelineStackProps extends cdk.StackProps {
  /** DynamoDB table for storing processed energy data */
  readonly calculatedEnergyTable: dynamodb.Table;
  /** Email address for SNS notifications */
  readonly adminEmailAddress: string;
  /**
   * Required: Reference to the SharedResourcesStack
   */
  readonly sharedResourcesStack: SharedResourcesStack;
}

/** Creates a serverless pipeline for processing energy usage data */
export class DataPipelineStack extends cdk.Stack {
  /** S3 bucket for raw CSV data uploads */
  public readonly rawDataLandingBucket: s3.Bucket;
  /** JSON data storage with versioning enabled */
  public readonly jsonTransformedBucket: s3.Bucket;
  /** SNS topic for new data upload notifications */
  public readonly snsTopicRawUpload: sns.Topic;
  /** SNS topic for calculation result notifications */
  public readonly snsTopicCalculatorSummary: sns.Topic;
  /** Transforms CSV files to normalized JSON format */
  public readonly transformToJsonLambdaFunction: lambda.Function;
  /** Processes energy data and sends notifications */
  public readonly calculateAndNotifyLambdaFunction: lambda.Function;

  constructor(scope: cdk.App, id: string, props: DataPipelineStackProps) {
    super(scope, id, props);

    /** S3 bucket for raw CSV data uploads */
    this.rawDataLandingBucket = new s3.Bucket(this, "RawDataLandingBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    });

    /** JSON data storage with versioning enabled */
    this.jsonTransformedBucket = new s3.Bucket(this, "JsonTransformedBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /** SNS topic for new data upload notifications */
    this.snsTopicRawUpload = new sns.Topic(this, "SnsTopicRawUpload", {
      displayName: "Home Energy Coach SNS Topic",
    });

    this.snsTopicRawUpload.addSubscription(
      new subscriptions.EmailSubscription(props.adminEmailAddress)
    );

    /** SNS topic for calculation result notifications */
    this.snsTopicCalculatorSummary = new sns.Topic(
      this,
      "SnsTopicCalculatorSummary",
      {
        displayName: "Home Energy Coach SNS Topic for calculator summary",
      }
    );

    this.snsTopicCalculatorSummary.addSubscription(
      new subscriptions.EmailSubscription(props.adminEmailAddress)
    );

    /** Transforms CSV files to normalized JSON format */
    this.transformToJsonLambdaFunction = new lambda.Function(
      this,
      "TransformToJsonLambdaFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.main",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "./lambda/lambda-transform-to-json")
        ),
        environment: {
          TRANSFORMED_JSON_BUCKET: this.jsonTransformedBucket.bucketName,
          NODE_OPTIONS: "--enable-source-maps",
        },
        description: "Lambda function transforms CSV to JSON and saves to S3",
      }
    );

    /** Processes energy data and sends notifications */
    this.calculateAndNotifyLambdaFunction = new lambda.Function(
      this,
      "CalculateAndNotifyLambdaFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.main",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "./lambda/lambda-calculate-notify")
        ),
        environment: {
          SNS_TOPIC_CALCULATOR_SUMMARY: this.snsTopicCalculatorSummary.topicArn,
          CALCULATED_ENERGY_TABLE_NAME: props.calculatedEnergyTable.tableName,
          NODE_OPTIONS: "--enable-source-maps",
        },
        description:
          "Lambda function calculates energy usage and sends notifications",
      }
    );

    // Set up permissions between components
    this.rawDataLandingBucket.grantRead(this.transformToJsonLambdaFunction);
    this.jsonTransformedBucket.grantWrite(this.transformToJsonLambdaFunction);
    this.jsonTransformedBucket.grantRead(this.calculateAndNotifyLambdaFunction);
    props.calculatedEnergyTable.grantWriteData(
      this.calculateAndNotifyLambdaFunction
    );

    // Wire up the event notifications
    this.rawDataLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(this.transformToJsonLambdaFunction),
      { suffix: ".csv" }
    );

    this.rawDataLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(this.snsTopicRawUpload),
      { suffix: ".csv.notify" }
    );

    this.jsonTransformedBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(this.calculateAndNotifyLambdaFunction),
      { suffix: ".json" }
    );

    // Export bucket names for reference
    new cdk.CfnOutput(this, "RawDataLandingBucketName", {
      value: this.rawDataLandingBucket.bucketName,
      description: "S3 bucket for raw CSV data uploads",
    });

    new cdk.CfnOutput(this, "JsonTransformedBucketName", {
      value: this.jsonTransformedBucket.bucketName,
      description: "S3 bucket for transformed JSON data",
    });

    // Add SNS topic outputs
    new cdk.CfnOutput(this, "SnsTopicRawUploadArn", {
      value: this.snsTopicRawUpload.topicArn,
      description: "ARN of the SNS topic for raw upload notifications",
    });

    new cdk.CfnOutput(this, "SnsTopicCalculatorSummaryArn", {
      value: this.snsTopicCalculatorSummary.topicArn,
      description: "ARN of the SNS topic for calculator summary notifications",
    });
  }
}
