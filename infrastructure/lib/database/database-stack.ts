import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DatabaseStack extends cdk.Stack {
  // Make these public so other stacks can access them
  public readonly table: dynamodb.Table;
  public readonly tableName: string;
  public readonly tableArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    this.table = new dynamodb.Table(this, "SimpleTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Store the name and ARN
    this.tableName = this.table.tableName;
    this.tableArn = this.table.tableArn;
  }
}
