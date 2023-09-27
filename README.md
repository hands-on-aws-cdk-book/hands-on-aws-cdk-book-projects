# Hands on AWS CDK Book Projects

This repository contains all project components, tutorials, and final project outputs for the Hands on AWS CDK book by Sam Ward Biddle and Kyle T. Jones, published by O'Reilly Media.

The main branch is a completed version of the shared project from the book: Home Energy Coach. Each chapter has a branch so that you can follow along with the project through each section of the book. Use the table of contents below to navigate to the project for each chapter.

## Table of Contents

- [Chapter 1 - Set up your development environment](https://github.com/hands-on-aws-cdk-book/hands-on-aws-cdk-book-projects/tree/chapter-1/)
- [Chapter 2 - Hello CDK](https://github.com/hands-on-aws-cdk-book/hands-on-aws-cdk-book-projects/tree/chapter-2/)

## Final Project Application Architecture

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
