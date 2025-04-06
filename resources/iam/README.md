# Create an Admin IAM User

When you first create an AWS account, you sign in with root user credentials. However, it's risky to use the powerful root account for everyday work! This guide provides two options to set up your IAM users:

## Option 1: One-Click Deployment

For quick setup, use our CloudFormation template to automatically create the required IAM users and policies:

[![Launch Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=IAMAdminSetup&templateURL=https://hands-on-aws-cdk-projects-iam-policy-one-click-cfn.s3.amazonaws.com/aws-cdk-developer-iam-policy-complete-template.yml)

1. Click the "Launch Stack" button above
2. Review the stack parameters and click "Next"
3. Click "Create Stack"
4. Wait for stack creation to complete (~2 minutes)
5. Check the Outputs tab for your new user credentials

## Option 2: Manual Policy Setup

If you prefer to understand and control the exact permissions, follow these steps:

### 1. GitHub Actions OIDC Integration Policy

1. Go to IAM Console
2. Create a new policy
3. Use the JSON editor and upload the `aws-github-actions-oidc-integration-policy.json` file

### 2. CDK Developer Policy

1. Go to IAM Console
2. Create a new policy
3. Use the JSON editor and upload the `aws-cdk-developer-iam-policy.json` file
   (Note: A detailed version is also available in `aws-cdk-developer-iam-policy-detailed.json`)

### 3. Attach Policies to Users

1. Create a new IAM user
2. Choose "Programmatic access" and "AWS Management Console access"
3. Attach the appropriate policy:
   - For GitHub Actions integration, attach the OIDC Integration Policy
   - For CDK developers, attach the CDK Developer Policy
4. Complete the user creation and save the credentials

## Security Notes

- Store credentials securely and never commit them to version control
- Follow the principle of least privilege when assigning permissions
- Regularly rotate access keys
- Enable MFA for all IAM users

## Need Help?

If you encounter any issues:

1. Check AWS CloudFormation console for stack creation errors
2. Verify your AWS account has sufficient permissions
3. Ensure you're in the correct AWS region
