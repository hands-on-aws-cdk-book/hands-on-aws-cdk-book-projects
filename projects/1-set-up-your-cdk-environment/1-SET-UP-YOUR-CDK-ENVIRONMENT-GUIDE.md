# Set up your environment

[[setup]]

## Setting up your development environment

In this chapter you will learn to set up your cloud development environment with VS Code, Git, and AWS CLI so that you can begin building cloud infrastructure. After you get set up, you can build your first project! This is the CDK equivilant to "Hello World!"

## What you will build

```mermaid

```

1. Some stuff
2. Some other stuff
3. Some other stuff

### 1/ Install VS Code

Download and install Visual Studio Code from the official website. Select the version created for your operating system.

[Download VS Code](https://code.visualstudio.com/)

### 2/ Set up your AWS account

1. Sign up for an AWS Account: Visit the [AWS website](https://aws.amazon.com/) and click on the "Create an AWS Account" button to start the sign-up process. Follow the instructions to provide the required information, such as email address, password, and payment details.

2. Provide Payment Information: AWS requires a valid payment method, such as a credit card, to verify your identity during the account setup process. You will not be charged unless you use paid services beyond the free tier.

3. Complete Identity Verification: As part of the account setup process, AWS may require additional identity verification, which can be done through phone verification or uploading identification documents.

### 3/ Install Prerequisites and Dependencies

Install Git for your operating system using teh offical git documentation:

[Download and Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

Download and install NodeJS for your operating system

[Install Node](https://nodejs.org/en/download)

```sh
npm -g install typescript
```

Install the AWS CDK CLI

```sh
npm install -g aws-cdk
```

Verify that you have the AWS CDK installed

```sh
cdk --version
```

Install the AWS CDK Standard Library

```sh
npm install aws-cdk-lib
```

### 4/ Set up your local AWS development profile

#### Create IAM role with admin access

1. Navigate to the AWS console and search for IAM in the search bar

2. Go to the IAM console in AWS and click "Roles" in the left navbar

3. Click "Create role"

4. Select "Another AWS account" for trusted entity

5. Enter your account ID number

6. Attach the "AdministratorAccess" policy

7. Give the role a name like "CdkDevelopmentAdminRole"

8. Click "Create role"

#### Create access keys

1. Go to the IAM console and click "Users" in the left navbar

2. Click your username

3. Select the "Security credentials" tab

4. Click "Create access key"

5. Copy the Access key ID and Secret access key

##### Configure AWS CLI

1. Install the AWS CLI on your local machine: <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>

2. Run `aws configure`

3. Enter the access key ID and secret access key when prompted

4. Set the default region name and output format

5. Test that it works by running `aws sts get-caller-identity`

### 5/ Create your first project

Navigate to your desired parent directory. This is where you will create your application.

```sh
mkdir hello-cdk-application
cd hello-cdk-application
```

Create your first CDK application using the AWS CDK CLI

```sh
cdk init app --language typescript
```

Build your application

```sh
npm run build
```

Bootstrap CDK

```sh
cdk bootstrap
```

Synthesize CDK

```sh
cdk synth
```

### 6/ Extension Activities

### FAQs

Q1. What if...
A1.

```

```
