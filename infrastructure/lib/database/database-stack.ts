import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DatabaseStack extends cdk.Stack {
  public readonly calculatedEnergyTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    this.calculatedEnergyTable = new dynamodb.Table(
      this,
      "CalculatedEnergyTable",
      {
        partitionKey: {
          name: "primaryKey",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "timestamp",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // Add Customer Index
    this.calculatedEnergyTable.addGlobalSecondaryIndex({
      indexName: "CustomerIndex",
      partitionKey: {
        name: "customerId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add Location Index
    this.calculatedEnergyTable.addGlobalSecondaryIndex({
      indexName: "LocationIndex",
      partitionKey: {
        name: "locationId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
