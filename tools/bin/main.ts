#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StackProjectTools } from "../lib/stack-project-tools";

const app = new cdk.App();

new StackProjectTools(app, "ProjectToolsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
