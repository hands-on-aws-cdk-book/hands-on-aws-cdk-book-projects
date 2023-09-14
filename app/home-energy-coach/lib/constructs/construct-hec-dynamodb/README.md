# ☁️ Home Energy Coach Custom DynamoDB Infrastructure Construct

This construct `HecDynamoDbConstruct` extends the default AWS CDK DynamoDB table construct by incorporating well-architected principles and default configurations to ensure compliance with `cdk_nag` AWS specifications.

## 🚀 What It Does

`HecDynamoDbConstruct` provides a pre-configured default DynamoDB table optimized for security and well-architected infrastructure. Features include:

1. Default provisioned billing mode, optimizing costs for small tables.
2. Point-in-time recovery enabled by default, allowing for data recovery in case of accidental deletions.
3. Easy setup for partition and sort keys.

## 🛠 How To Use

To utilize the `HecDynamoDbConstruct`, you'll need to import it and provide the necessary properties:

```typescript
import { HecDynamoDbConstruct } from "path-to-construct";

const myTable = new HecDynamoDbConstruct(this, "MyTableID", {
  tableName: "MyDynamoTable",
  partitionKey: {
    name: "PrimaryKey",
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: "SortKey",
    type: dynamodb.AttributeType.NUMBER,
  },
  readCapacity: 5,
  writeCapacity: 5,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});
```

## ⚙️ Configuration Details

Here's what you can specify for the construct:

- tableName: (Optional) Name of the DynamoDB table.
- billingMode: (Optional) Billing mode for the table, default is PROVISIONED.
- readCapacity: (Optional) Read capacity for the table, default is 1.
- writeCapacity: (Optional) Write capacity for the table, default is 1.
- removalPolicy: (Optional) Removal policy for the table, default is DESTROY (Not - recommended for production).
- partitionKey: (Required) The partition key configuration.
- sortKey: (Required) The sort key configuration.
- pointInTimeRecovery: (Optional) Enable or disable point in time recovery, default is true.

## 📦 Additional Features

Included by default in the construct:

- Provisioned Billing Mode: Reduces costs for smaller tables.
- Point-in-Time Recovery: Allows for recovery of deleted data, enhancing data resilience.
- Configurable Keys: Easily set up partition and sort keys tailored to your application's needs.

Happy building! 🚧🔧🎉
