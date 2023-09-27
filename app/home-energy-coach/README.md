# Home Energy Coach CDK Application

Home Energy Coach helps consumers understand patterns in their energy usage and get recommendations and tips to save money, reduce carbon emissions, and optimize their home energy use.

## Architecture

```mmd

%%{
  init: {
    "theme": "dark",
    "scale": "2"
  }
}%%

flowchart LR

InputData[Electric Utility Data]-->
inputS3[Custom S3 Bucket<br/>Raw Data]

inputS3-->
EventBridge1[Amazon EventBridge<br/>Data Upload Event Trigger 🎬]

EventBridge1-->
SNS1[Simple Notification Service<br/>Upload Notification 📲]

EventBridge1-->
Lambda1(Custom Lambda Function<br/>Transform CSV to JSON)

Lambda1
EventBridge2[Amazon EventBridge<br/>Energy Usage Calculator 🧮]

EventBridge2-->
Lambda2(Custom Lambda Function<br/>Calculate Energy Usage)

Lambda2-->
DynamoDBTable(DynamoDB<br/>Calculated Energy Data)

Lambda2-->
analyticsS3(Custom S3 Bucket<br/>Calculated Energy Data)

Lambda2-->
SNS2[Simple Notification Service<br/>Send Calculator Output 📲]

GraphQLAPI(GraphQL API<br/>Query DynamoDB)-->
DynamoDBTable

KendraSearch(Custom Kendra Construct 🔎<br/>Search Electric Usage Records)-->
DynamoDBTable

GrafanaDashboard(Grafana Dashboard 📉<br/>Custom Resource<br/>Display Electric Usage Records)-->
DynamoDBTable

Amplify(Amplify Web Application 💻<br/>Custom Construct<br/>Upload and Display Data)-->
GraphQLAPI

Quicksight(Quicksight Dashboard 📊<br/>Custom Resource & Cloudformation<br/>Display Electric Usage Records)-->
analyticsS3

ForecastStack(Amazon Forecast 🌡<br/>Forecast Electric Usage)-->
analyticsS3

GenAIChatInterface(GenAI Chatbot API 💬<br/>Community Construct)-->
DynamoDBTable

GenAIChatInterface-->
KendraSearch

GenAIChatInterface-->
ForecastStack


```

## Get started

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
