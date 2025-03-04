/**
 * Import various modules from AWS CDK and nodejs core libraries
 */
import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_sns as sns } from "aws-cdk-lib";
import { aws_sns_subscriptions as subscriptions } from "aws-cdk-lib";
import { aws_cognito as cognito } from "aws-cdk-lib";
import { CognitoConstruct } from "../../constructs/cognito/cognito-construct";

export interface SharedResourcesStackProps extends cdk.StackProps {
  /**
   * Required: The email address to use for the SNS topic
   */
  readonly adminEmailAddress: string;
  /**
   * Optional: Stage name (dev, prod, etc)
   */
  readonly stage?: string;
}

/**
 * The stack class extends the base CDK Stack
 */
export class SharedResourcesStack extends cdk.Stack {
  /**
   * Constructor for the stack
   * @param {cdk.App} scope - The CDK application scope
   * @param {string} id - Stack ID
   * @param {cdk.StackProps} props - Optional stack properties
   */

  public readonly rawDataUploadBucket: s3.Bucket;
  public readonly snsTopicRawUpload: sns.Topic;
  public readonly snsTopicCalculatorSummary: sns.Topic;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: cdk.App, id: string, props: SharedResourcesStackProps) {
    // Call super constructor
    super(scope, id, props);

    const stage = props.stage ?? "dev";

    // Create Cognito resources using our construct
    const auth = new CognitoConstruct(this, "Auth", {
      userPoolName: `EnergyCoach-${stage}-UserPool`,
      userPoolClientName: `EnergyCoach-${stage}-Client`,
      customAttributes: {
        preferredUnit: new cognito.StringAttribute({
          mutable: true,
          stringConstraints: { minLen: 3, maxLen: 4 }, // kWh or BTU
        }),
      },
    });

    // Store Cognito references
    this.userPool = auth.userPool;
    this.userPoolClient = auth.userPoolClient;
    this.identityPool = auth.identityPool;

    // Create raw landing bucket for S3

    this.rawDataUploadBucket = new s3.Bucket(this, "RawDataUploadBucket", {
      // Adds a removal policy that will destroy the bucket when the stack is destroyed
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // Auto-delete objects from the bucket when the stack is destroyed
      autoDeleteObjects: true,
      // Set lifecycle policy to expire objects after 1 minute
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    });

    // Create SNS Notification topic
    this.snsTopicRawUpload = new sns.Topic(this, "SnsTopicRawUpload", {
      displayName: "Home Energy Coach SNS Topic",
    });

    this.snsTopicRawUpload.addSubscription(
      new subscriptions.EmailSubscription(props.adminEmailAddress)
    );

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

    // Add Cognito outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "Cognito User Pool ID",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "Cognito User Pool Client ID",
    });

    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: this.identityPool.ref,
      description: "Cognito Identity Pool ID",
    });
  }
}
