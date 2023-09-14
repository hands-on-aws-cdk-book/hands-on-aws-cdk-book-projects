import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";

interface HecDynamoDbProps {
  /**
   * Required: name of the DynamoDB table.
   */
  readonly tableName?: string;

  /**
   * Optional: set billing mode for the table.
   * @default BillingMode.PROVISIONED
   */
  readonly billingMode?: dynamodb.BillingMode;

  /**
   * Optional: set read capacity for the table.
   * @default 1
   */
  readonly readCapacity?: number;

  /**
   * Optional: set write capacity for the table.
   * @default 1
   */
  readonly writeCapacity?: number;

  /**
   * Optional: set removal policy for the table.
   * @default cdk.RemovalPolicy.DESTROY
   */
  readonly removalPolicy?: cdk.RemovalPolicy;

  /**
   * Required: set partition key for the table.
   */
  readonly partitionKey: {
    name: string;
    type: dynamodb.AttributeType;
  };

  /**
   * Required: set sort key for the table.
   */
  readonly sortKey: {
    name: string;
    type: dynamodb.AttributeType;
  };

  /**
   * Optional: enable point in time recovery for the table.
   * @default true
   */
  readonly pointInTimeRecovery?: boolean;
}

/**
 * This construct provides a pre-configured default DynamoDB table.
 * This pre-configured default meets cdk_nag AWS specifications
 * for security and well-architected infrastructure.
 */

export class HecDynamoDbConstruct extends dynamodb.Table {
  /**
   * DynamoDB table object to be passed to other constructs or functions.
   */
  public readonly dynamoTable: dynamodb.Table;

  /**
   * Creates a DynamoDB table with a set of default configurations.
   * @param scope
   * @param id
   * @param HecDynamoDbProps
   */
  constructor(scope: Construct, id: string, props: HecDynamoDbProps) {
    super(scope, id, {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      sortKey: props.sortKey,
      billingMode: props.billingMode || dynamodb.BillingMode.PROVISIONED, // Reduces cost for small tables
      readCapacity: props.readCapacity || 1, // Reduces cost for small tables
      writeCapacity: props.writeCapacity || 1, // Reduces cost for small tables
      removalPolicy: props.removalPolicy || cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
      // Allows for recovery of deleted data
      pointInTimeRecovery:
        props.pointInTimeRecovery !== undefined
          ? props.pointInTimeRecovery
          : true,
    });

    this.dynamoTable = this;
  }
}
