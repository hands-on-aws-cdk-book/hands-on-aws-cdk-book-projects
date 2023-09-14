import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_apigateway as apigateway } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as path from "path";

/**
 * Props for ConstructApiRest.
 */
export interface ConstructApiRestProps extends cdk.StackProps {
  /**
   * Provided DynamoDB table.
   * @type {dynamodb.Table}
   */
  table: dynamodb.Table;

  /**
   * Lambda function asset path.
   * @type {string}
   */
  lambdaAssetPath: string;
}

export class ConstructApiRest extends Construct {
  constructor(scope: Construct, id: string, props: ConstructApiRestProps) {
    super(scope, id);

    // Define the Lambda function
    const handler = new lambda.Function(this, "Handler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(props.lambdaAssetPath),
      handler: "index.handler",
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    // Grant the Lambda function permission to read/write to the table
    props.table.grantReadWriteData(handler);

    // Set up the API Gateway
    const api = new apigateway.LambdaRestApi(this, "Endpoint", {
      handler: handler,
      proxy: false,
    });

    // Define REST API endpoints
    const items = api.root.addResource("items");
    items.addMethod("GET"); // Get all items
    const singleItem = items.addResource("{id}");
    singleItem.addMethod("GET"); // Get a specific item by ID
    singleItem.addMethod("POST"); // Add a new item
    singleItem.addMethod("PUT"); // Update an item
    singleItem.addMethod("DELETE"); // Delete an item
  }
}
