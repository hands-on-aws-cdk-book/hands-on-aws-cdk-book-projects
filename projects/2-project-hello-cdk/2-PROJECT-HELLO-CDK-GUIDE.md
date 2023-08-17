# Hello CDK Project

[[project-hello-cdk]]

## Setting up your development environment

In this project you will build

## What you will build

```mmd

```

1. S3 Bucket for raw data upload
2. Amazon Eventbridge notification to trigger an event when an object is uploaded to the S3 bucket
3. AWS Lambda function to print a greeting from an uploaded text document

### 1/ Rename your files

Rename the stack located at `./lib/my-cdk-stack` to `stack-hello-cdk.ts`

### 2/ Modify your main stack

Check the name of your main Stack to HelloCdkStack

```typescript

```

### 3/ Add an S3 bucket

```typescript
// import the AWS CDK Library as cdk
import * as cdk from "aws-cdk-lib";
// import the s3 construct from the AWS CDK Library
import * as s3 from "aws-cdk-lib/aws-s3";

/**
 * The stack class extends the base CDK Stack
 */
export class HelloCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for uploading greetings
    const helloCdkS3Bucket = new s3.Bucket(this, "HelloCdkS3Bucket");
  }
}
```

### 4a/ Add a lambda function to your stack

```typescript
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
// import the lambda construct from the AWS CDK Library
import * as lambda from "aws-cdk-lib/aws-lambda";
// import path from the standard javascript library
import * as path from "path";

/**
 * The stack class extends the base CDK Stack
 */
export class HelloCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for uploading greetings
    const helloCdkS3Bucket = new s3.Bucket(this, "HelloCdkS3Bucket");

    // Create Lambda function to generate greeting
    const helloCdkLambdaFunction = new lambda.Function(this, "HelloCdkLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.main",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "./assets/lambda-hello-cdk")
      ),
    });

    // Output S3 bucket name
    new cdk.CfnOutput(this, "bucketName", {
      value: helloCdkS3Bucket.bucketName,
    });
  }
}
```

### 4b/ Create your lambda function

```sh
mkdir ./lib/assets
mkdir ./lib/assets/lambda-hello-cdk
touch ./lib/assets/lambda-hello-cdk/index.js
```

```javascript
const aws = require("aws-sdk");
const s3 = new aws.S3();

/**
 * Lambda function invoked on S3 object created event
 *
 * @param {Object} event - The S3 event data
 * @returns {Object} - The response including body and statusCode
 */
exports.main = async (event) => {
  // Print greeting with name
  const msg = `Hello, CDK! 👋`;

  console.log(msg);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: msg,
    }),
  };
};
```

### 5/ Add an eventbridge notification

```typescript
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
// import the lambda construct from the AWS CDK Library
import * as lambda from "aws-cdk-lib/aws-lambda";
// import path from the standard javascript library
import * as path from "path";

/**
 * The stack class extends the base CDK Stack
 */
export class HelloCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for uploading greetings
    const helloCdkS3Bucket = new s3.Bucket(this, "HelloCdkS3Bucket");

    // Create Lambda function to generate greeting
    const helloCdkLambdaFunction = new lambda.Function(this, "HelloCdkLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.main",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "./assets/lambda-hello-cdk")
      ),
    });

    // Invoke lambda when new object created in S3 bucket
    helloCdkS3Bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(helloCdkLambdaFunction),
      { suffix: ".txt" }
    );

    // Output S3 bucket name
    new cdk.CfnOutput(this, "bucketName", {
      value: helloCdkS3Bucket.bucketName,
    });
  }
}
```

### 6/ Test your function

Navigate to the AWS Console and search for Lambda in the search bar

Select your Lambda function

Click Test

Enter dummy data

Click test

The test should return a log similar to what is shown below

```

```

### 8/ Test your full application

Upload some data to S3

Go check your lambda function output

It should show...

### 7/ Modify your function to dynamically generate a greeting

```javascript
const aws = require("aws-sdk");
const s3 = new aws.S3();

/**
 * Lambda function invoked on S3 object created event
 *
 * @param {Object} event - The S3 event data
 * @returns {Object} - The response including body and statusCode
 */
exports.main = async (event) => {
  // Get bucket and object key from event
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  // Get object data from S3
  const params = {
    Bucket: bucket,
    Key: key,
  };
  const data = await s3.getObject(params).promise();

  // Extract name from object data
  const name = data.Body.toString("utf-8").trim();

  // Print greeting with name
  const msg = `Hello, ${name}! I am your new energy assistant.`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: msg,
    }),
  };
};
```

### 8/ Test your function

Use CDK Diff to see what changes will be made when the application is deployed

```sh
cdk diff
```

Follow the steps above to test your function again. This time the output should be similar, but should be dynamically

### 9/ Destroy your application

```sh
cdk destroy --all
```

### 10/ Deploy again

```sh
cdk deploy --all
```

### Extension Activities

- Modify your Lambda function to produce a different greeting by generating another sentence
- Modify your lambda function to produce several greetings from
- Explore the Lambda CDK construct documentation and make changes to your lambda function configuration
- Try writing your lambda function in a different language like Python or Golang. Be sure to update the function and also update the lambda infrastructure.

### FAQs

Q1. What if...
A1.

```

```
