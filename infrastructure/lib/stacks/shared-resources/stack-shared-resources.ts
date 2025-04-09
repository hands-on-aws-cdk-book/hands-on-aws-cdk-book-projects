/**
 * Import various modules from AWS CDK and nodejs core libraries
 */
import * as cdk from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";

export interface SharedResourcesStackProps extends cdk.StackProps {
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

  public readonly calculatedEnergyTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props: SharedResourcesStackProps) {
    // Call super constructor
    super(scope, id, props);

    const stage = props.stage ?? "dev";

    // Create DynamoDB table
    this.calculatedEnergyTable = new dynamodb.Table(
      this,
      "CalculatedEnergyTable",
      {
        partitionKey: {
          name: "customerId",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: "timestamp", type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // For development - change for production
        timeToLiveAttribute: "ttl",
        pointInTimeRecovery: true,
      }
    );

    // Add GSI for querying by location
    this.calculatedEnergyTable.addGlobalSecondaryIndex({
      indexName: "CustomerLocationsIndex",
      partitionKey: { name: "customerId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "locationId", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add DynamoDB output
    new cdk.CfnOutput(this, "CalculatedEnergyTableName", {
      value: this.calculatedEnergyTable.tableName,
      description: "DynamoDB table for calculated energy data",
    });
  }
}
