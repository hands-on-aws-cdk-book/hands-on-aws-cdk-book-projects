import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the Cognito User Pool
    this.userPool = new cognito.UserPool(this, "EnergyCoachUserPool", {
      userPoolName: "energy-coach-user-pool",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    // Create the User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(
      this,
      "EnergyCoachUserPoolClient",
      {
        userPool: this.userPool,
        generateSecret: false,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          userSrp: true,
        },
      }
    );

    // Stack outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }
}
