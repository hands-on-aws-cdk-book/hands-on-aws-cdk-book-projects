/**
 * Import various modules from AWS CDK and nodejs core libraries
 */
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";

/**
 * The stack class extends the base CDK Stack
 */
export class DataPipelineStack extends cdk.Stack {
  /**
   * Constructor for the stack
   * @param {cdk.App} scope - The CDK application scope
   * @param {string} id - Stack ID
   * @param {cdk.StackProps} props - Optional stack properties
   */
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    // Call super constructor
    super(scope, id, props);

    // Create S3 bucket for uploading energy usage data
    const rawDataUploadS3Bucket = new s3.Bucket(this, "HelloCdkS3Bucket");

    const dataUploadNotificationTopic = new sns.Topic(
      this,
      "DataUploadNotificationTopic"
    );

    // Create Lambda function to generate data upload notification
    const uploadNotificationLambdaFunction = new lambda.Function(
      this,
      "UploadNotificationLambdaFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.main",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "./assets/lambda-hello-cdk")
        ),
        // we establish environmental variables for the lambda function
        // this variable contains the arn of the data upload notification topic
        // this will allow us to send a notification from our lambda function
        environment: {
          DATA_UPLOAD_NOTIFICATION_TOPIC: dataUploadNotificationTopic.topicArn,
        },
      }
    );

    // grant permission for the data upload lambda function to publish
    // to the upload notification topic
    dataUploadNotificationTopic.grantPublish(uploadNotificationLambdaFunction);

    // Invoke lambda when new object created in S3 bucket
    rawDataUploadS3Bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(uploadNotificationLambdaFunction),
      { suffix: ".csv" } // notice that we have changed the suffix to csv
    );

    // Output the upload notification topic name
    new cdk.CfnOutput(this, "UploadNotificationTopicName", {
      value: dataUploadNotificationTopic.topicName,
    });

    // Output the raw data upload bucket name
    new cdk.CfnOutput(this, "RawDatUploadBucketName", {
      value: rawDataUploadS3Bucket.bucketName,
    });
  }
}
