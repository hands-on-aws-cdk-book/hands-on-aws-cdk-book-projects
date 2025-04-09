import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomAmplifyConstruct } from "@hands-on-aws-cdk-book/custom-amplify-construct";

interface WebStackProps extends cdk.StackProps {
  githubRepositoryUrl: string;
  githubBranch: string;
  userPoolId: string;
  userPoolClientId: string;
  region: string;
  githubTokenSecretName: string;
  apiEndpointUrl: string;
}

export class WebStack extends cdk.Stack {
  public readonly amplifyApp: CustomAmplifyConstruct;

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    // Create Amplify app using the custom construct
    this.amplifyApp = new CustomAmplifyConstruct(this, "AmplifyApp", {
      appName: "MyWebApp",
      githubRepositoryUrl: props.githubRepositoryUrl,
      githubTokenSecretName: props.githubTokenSecretName,
      branch: props.githubBranch,
      environmentVariables: {
        VITE_USER_POOL_ID: props.userPoolId,
        VITE_USER_POOL_CLIENT_ID: props.userPoolClientId,
        VITE_REGION: props.region,
        VITE_API_ENDPOINT: props.apiEndpointUrl,
      },
      includeViteRegion: true,
      baseDirectory: "build", // Adjust based on your build output directory
    });
  }
}
