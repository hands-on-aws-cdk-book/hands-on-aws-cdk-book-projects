# ☁️ Home Energy Coach Custom Lambda Infrastructure Construct

This construct `HecNodeLambdaConstruct` extends the default AWS CDK Lambda function construct by incorporating well-architected principles and default configurations to ensure compliance with `cdk_nag` AWS specifications.

## 🚀 What It Does

`HecNodeLambdaConstruct` offers a pre-configured default Lambda Function that is optimized for security and well-architected infrastructure. Features include:

1. X-Ray tracing enabled by default.
2. Usage of the x86 architecture, specifically targeting Graviton2 instances for improved performance and reduced electricity consumption.
3. An integrated FIFO dead letter queue (DLQ) for addressing failed lambda executions.

## 🛠 How To Use

To make use of the `HecNodeLambdaConstruct`, you'll need to import it and pass in the necessary properties:

```typescript
import { HecNodeLambdaConstruct } from "path-to-construct";

const myLambda = new HecNodeLambdaConstruct(this, "MyLambdaID", {
  lambdaName: "MyLambda",
  runtime: lambda.Runtime.NODEJS_14_X,
  code: lambda.Code.fromAsset("path-to-lambda-code"),
  handler: "index.handler",
  concurrencyLimit: 50,
  timeout: Duration.minutes(10),
  role: myIAMRole,
  description: "My awesome lambda function",
  layers: [myLayer1, myLayer2],
  environment: {
    KEY1: "Value1",
    KEY2: "Value2",
  },
});
```

## ⚙️ Configuration Details

Here are the configurations you can specify for the construct:

- lambdaName: (Optional) Name of the lambda function.
- concurrencyLimit: (Optional) Concurrency limit for the lambda, default is 100.
- timeout: (Optional) Timeout duration, default is 15 minutes.
- runtime: (Required) Lambda runtime environment.
- role: (Optional) Specific IAM role for the lambda function.
- description: (Optional) Description for the lambda function.
- handler: (Required) The handler function in your lambda code.
- code: (Required) Directory path or asset for the lambda code.
- layers: (Optional) Lambda layers.
- environment: (Optional) Environment variables for the lambda. Note: These are encrypted by default.

## 📦 Additional Features

Included by defaykt in the construct:

- FIFO DLQ: A dead letter queue is created to handle messages not processed by the Lambda function.
- Graviton2 Based Architecture: Uses x86_64 architecture to harness the efficiency of Graviton2.
- X-Ray Tracing: All functions enabled with this construct come with X-Ray tracing for enhanced observability.

Keep on building! 🚧🔧🎉
