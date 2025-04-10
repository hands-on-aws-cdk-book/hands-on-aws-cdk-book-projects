/**
 * Import various modules from AWS CDK and nodejs core libraries
 */
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as iam from "aws-cdk-lib/aws-iam";

/**
 * The stack class extends the base CDK Stack
 */
export class HelloCdkStack extends cdk.Stack {
  /**
   * Constructor for the stack
   * @param {cdk.App} scope - The CDK application scope
   * @param {string} id - Stack ID
   * @param {cdk.StackProps} props - Optional stack properties
   */
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    // Call super constructor
    super(scope, id, props);

    // Create S3 bucket for uploading greetings
    const helloCdkS3Bucket = new s3.Bucket(this, "HelloCdkS3Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create Lambda function to generate greeting
    const helloCdkLambdaFunction = new lambda.Function(this, "HelloCdkLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda")),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

    // Grant Lambda permissions to read from S3
    helloCdkS3Bucket.grantRead(helloCdkLambdaFunction);

    // Invoke lambda when new object created in S3 bucket
    helloCdkS3Bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(helloCdkLambdaFunction),
      { suffix: ".txt" }
    );

    // Output S3 bucket name
    new cdk.CfnOutput(this, "bucketName", {
      value: helloCdkS3Bucket.bucketName,
      description: "Name of the S3 bucket for uploading greetings",
    });
  }
}
