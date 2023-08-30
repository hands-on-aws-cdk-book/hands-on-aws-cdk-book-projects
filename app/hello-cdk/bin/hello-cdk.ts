#!/usr/bin/env node

// Our imports include standard imports for the app
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
// Here we import all the stack and resources that
// we are deploying within the app
import { HelloCdkStack } from "../lib/stack-hello-cdk";

/**
 * Environment configuration for the CDK app.
 * This includes the account and region.
 * In this configuration account and region are
 * taken from environmental variables with the AWS
 * CLI configured AWS profile.
 * @type {Object}
 */
const appEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

/**
 * Description for the stack. This description gets
 * passed in to every stack to create a unique identifier.
 * @type {string}
 */
const desc =
  "Home energy coach application from Hands-on AWS CDK Book (created by: Sam Ward Biddle)";

/**
 * The CDK app.
 * This is the top level class and all stacks and constructs are
 * defined within this app construct. There can only be one app
 * within this file, but you can have multiple apps within the
 * bin director.
 * @type {cdk.App}
 */
const app = new cdk.App();

/**
 * HelloCdkStack constructor.
 * We are instantiating a new instance of
 * the HelloCdkStack class and passing in the props below
 * @constructor
 * @param {cdk.App} scope - The CDK app scope.
 * @param {string} id - Stack ID.
 * @param {Object} props - Stack properties.
 */
new HelloCdkStack(app, "HelloCdkStack", {
  env: appEnv,
  desc,
});
