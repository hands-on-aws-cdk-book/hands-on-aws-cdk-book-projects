import * as cdk from "aws-cdk-lib";
import * as amplify from "@aws-cdk-lib/aws-amplify";
import { Construct } from "constructs";

interface WebStackProps extends cdk.StackProps {
  githubRepo: string;
  githubBranch: string;
  githubOwner: string;
  userPoolId: string;
  userPoolClientId: string;
  region: string;
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    // Create Amplify app
    const amplifyApp = new amplify.CfnApp(this, "AmplifyApp", {
      name: "MyWebApp",
      repository: `https://github.com/${props.githubOwner}/${props.githubRepo}`,
      // Removed accessToken since it's not needed for public repos

      // Rest of the configuration remains the same
      buildSpec: {
        version: 1,
        frontend: {
          phases: {
            preBuild: {
              commands: ["npm ci"],
            },
            build: {
              commands: ["npm run build"],
            },
          },
          artifacts: {
            baseDirectory: "build",
            files: ["**/*"],
          },
        },
      },

      environmentVariables: [
        {
          name: "REACT_APP_USER_POOL_ID",
          value: props.userPoolId,
        },
        {
          name: "REACT_APP_USER_POOL_CLIENT_ID",
          value: props.userPoolClientId,
        },
        {
          name: "REACT_APP_REGION",
          value: props.region,
        },
      ],
    });

    // Add branch
    new amplify.CfnBranch(this, "AmplifyBranch", {
      appId: amplifyApp.attrAppId,
      branchName: props.githubBranch,
      enableAutoBuild: true,
    });
  }
}
