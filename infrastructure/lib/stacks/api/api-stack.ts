import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import { RestApiConstruct } from "../../constructs/rest-api/rest-api-construct";
import * as path from "path";

interface EnergyApiStackProps extends cdk.StackProps {
  readonly calculatedEnergyTable: dynamodb.Table;
  readonly userPool?: cognito.IUserPool;
  readonly userPoolClient?: cognito.IUserPoolClient;
  readonly customEnvironmentVariables?: Record<string, string>;
}

export class EnergyApiStack extends cdk.Stack {
  public readonly restApiEndpoint: string;
  public readonly graphqlApiKey?: string;

  constructor(scope: cdk.App, id: string, props: EnergyApiStackProps) {
    super(scope, id, props);

    // REST API Implementation
    const restApi = new RestApiConstruct(this, "EnergyRestApi", {
      table: props.calculatedEnergyTable,
      handlersPath: path.join(__dirname, "lambda"),
      apiName: "HomeEnergyCoachRESTAPI",
      description: "REST API for energy usage data",
      cors: {
        allowOrigins: ["*"], // Restrict in production
      },
      auth: {
        cognitoUserPool: props.userPool,
        apiKey: true,
      },
      operations: [
        {
          method: "GET",
          path: "/readings/{customerId}",
          name: "GetReadings",
          handlerFile: "get-readings",
          requestValidator: {
            requiredQueryParams: ["from", "to"],
            requiredHeaders: ["x-api-key"],
          },
          environment: props.customEnvironmentVariables,
        },
        {
          method: "GET",
          path: "/summary/{customerId}/{locationId}",
          name: "GetSummary",
          handlerFile: "get-summary",
          requestValidator: {
            requiredQueryParams: ["year", "month"],
            requiredHeaders: ["x-api-key"],
          },
          environment: props.customEnvironmentVariables,
        },
        {
          method: "POST",
          path: "/chat",
          name: "Chat",
          handlerFile: "chat",
          environment: {
            ...props.customEnvironmentVariables,
            BEDROCK_REGION: "us-east-1",
          },
        },
      ],
    });

    // Grant Bedrock permissions to the chat Lambda function
    const chatLambda = restApi.lambdas["Chat"];
    chatLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["bedrock:InvokeModel"],
        resources: ["*"], // In production, restrict to specific model ARNs
      })
    );

    // Store endpoints
    this.restApiEndpoint = restApi.api.url;

    // Stack outputs
    new cdk.CfnOutput(this, "RestApiEndpoint", {
      value: this.restApiEndpoint,
      description: "REST API Endpoint URL",
    });
  }
}
