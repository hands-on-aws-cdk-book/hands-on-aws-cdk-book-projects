#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DataPipelineStack } from "../lib/data-pipeline/stack-data-pipeline";
import { SharedResourcesStack } from "../lib/shared-resources/stack-shared-resources";
import { DatabaseStack } from "../lib/database/database-stack";
import { EnergyApiStack } from "../lib/api/api-stack";

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

checkRequiredContext(app, "environment");

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

const sharedResourcesStack = new SharedResourcesStack(
  app,
  `${deployment}SharedResourcesStack`,
  {
    ...defaultStackProps,
    adminEmailAddress,
  }
);

const databaseStack = new DatabaseStack(app, `${deployment}DatabaseStack`, {
  ...defaultStackProps,
});

new DataPipelineStack(app, `${deployment}DataPipelineStack`, {
  ...defaultStackProps,
  rawDataLandingBucket: sharedResourcesStack.rawDataUploadBucket,
  snsTopicRawUpload: sharedResourcesStack.snsTopicRawUpload,
  snsTopicCalculatorSummary: sharedResourcesStack.snsTopicCalculatorSummary,
  calculatedEnergyTable: databaseStack.calculatedEnergyTable,
});

const apiStack = new EnergyApiStack(app, `${deployment}EnergyApiStack`, {
  ...defaultStackProps,
  calculatedEnergyTable: databaseStack.calculatedEnergyTable,
});
