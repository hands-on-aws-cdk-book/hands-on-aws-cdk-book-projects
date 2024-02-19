import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 as s3 } from "aws-cdk-lib";

export class StackProjectTools extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for IAM Policy for CDK development
    // This is used for one-click cloudformation stack deployment

    const cdkProjectDeveloperIamPolicyBucket = new s3.Bucket(
      this,
      "CdkProjectDeveloperIamPolicyBucket",
      {
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        publicReadAccess: true,
        enforceSSL: true,
        minimumTLSVersion: 1.2,
      }
    );

    // S3 bucket for IAM Policy for Github OIDC Integration
    // This is used for one-click cloudformation stack deployment

    const cdkProjectGithubOidcPolicyBucket = new s3.Bucket(
      this,
      "CdkProjectGithubOidcPolicyBucket",
      {
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        publicReadAccess: true,
        enforceSSL: true,
        minimumTLSVersion: 1.2,
      }
    );
  }
}
