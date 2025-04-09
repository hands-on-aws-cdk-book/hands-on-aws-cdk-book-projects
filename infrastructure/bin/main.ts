#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DataPipelineStack } from "../lib/stacks/data-pipeline/stack-data-pipeline";
import { SharedResourcesStack } from "../lib/stacks/shared-resources/stack-shared-resources";
import { ApiStack } from "../lib/stacks/api/api-stack";
import { AuthStack } from "../lib/stacks/auth/stack-auth";
import { ChatbotStack } from "../lib/stacks/chatbot/chatbot-stack";
import { WebStack } from "../lib/stacks/web/web-stack";
import { HelloCdkStack } from "../lib/stacks/hello-cdk/hello-cdk-stack";

/** Environment configuration for all stacks */
const appEnv: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

// Function to check for required context
function checkRequiredContext(app: cdk.App, key: string): void {
  const contextValue = app.node.tryGetContext(key);
  if (!contextValue) {
    console.error(`Error: Missing required context value for '${key}'.`);
    process.exit(1);
  }
}

const deployment = app.node.tryGetContext("environment") || "dev";
const adminEmailAddress =
  app.node.tryGetContext("adminEmailAddress") || "example@example.com";
const identityCenterInstanceArn = app.node.tryGetContext(
  "identityCenterInstanceArn"
);

checkRequiredContext(app, "environment");
checkRequiredContext(app, "identityCenterInstanceArn");

/** Default props to be used by all stacks */
const defaultStackProps: cdk.StackProps = {
  env: appEnv,
  description:
    "Home energy coach application (created by: Sam Ward Biddle & Kyle T. Jones)",
  tags: {
    Environment: deployment,
    Project: "HomeEnergyCoach",
  },
};

// Create shared resources first (includes DynamoDB)
const sharedResourcesStack = new SharedResourcesStack(
  app,
  "SharedResourcesStack",
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  }
);

// Create auth stack
const authStack = new AuthStack(app, `AuthStack`, {
  ...defaultStackProps,
});

// Create data pipeline stack
const dataPipelineStack = new DataPipelineStack(app, "DataPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  sharedResourcesStack,
  calculatedEnergyTable: sharedResourcesStack.calculatedEnergyTable,
  adminEmailAddress: "admin@example.com", // Replace with actual admin email
});

// Create Q Business chatbot stack
const chatbotStack = new ChatbotStack(app, `ChatbotStack`, {
  ...defaultStackProps,
  calculatedEnergyTable: sharedResourcesStack.calculatedEnergyTable,
  identityCenterInstanceArn: identityCenterInstanceArn,
  knowledgeBaseBucket: dataPipelineStack.jsonTransformedBucket,
});

// Create API stack
const apiStack = new ApiStack(app, `ApiStack`, {
  ...defaultStackProps,
  calculatedEnergyTable: sharedResourcesStack.calculatedEnergyTable,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  customEnvironmentVariables: {
    Q_CHATBOT_ID: chatbotStack.chatbot.chatbotId,
    Q_CHATBOT_ENABLED: "true",
  },
});

// Create Web stack with Amplify
const webStack = new WebStack(app, `WebStack`, {
  ...defaultStackProps,
  githubRepositoryUrl:
    "https://github.com/hands-on-aws-cdk-book/home-energy-coach-frontend-sample",
  githubBranch: "main",
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
  region: appEnv.region || "us-east-1",
  githubTokenSecretName: "github-token", // Replace with your actual secret name
  apiEndpointUrl: apiStack.restApiEndpoint, // Use the restApiEndpoint property
});

// Create Hello CDK stack
const helloCdkStack = new HelloCdkStack(app, `HelloCdkStack`, {
  ...defaultStackProps,
});

// Add dependencies
dataPipelineStack.addDependency(sharedResourcesStack);
webStack.addDependency(authStack);

app.synth();
