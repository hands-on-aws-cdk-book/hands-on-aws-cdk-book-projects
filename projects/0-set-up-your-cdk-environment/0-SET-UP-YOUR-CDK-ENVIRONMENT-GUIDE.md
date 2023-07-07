# Set up your environment!

[[setup]]
== Setting up your development environment
In this chapter you will learn to set up your cloud development environment with VS Code, Git, and AWS CLI so that you can begin building cloud infrastructure. After you get set up, you can build your first project! This is the CDK equivilant to "Hello World!"  

You will use the environement you set up here  to build, manage, and deploy CDK projects in the rest of this book.

- Welcome to your IDE
- Set up your AWS Account
- Building your first project

=== Welcome to your IDE, Visual Studio Code

You need an Integrated Development Environment (IDE) in order to work with the Cloud Development Kit (CDK). You can use any IDE you like. For the examples in this book, we will use Visual Studio Code (VSCode), which provides a rich set of features for code editing, debugging, and version control. 

Steps for setting up VSCode:
1.	Install VSCode: Download and install Visual Studio Code from the official website (https://code.visualstudio.com/) for your operating system.

2.	Install CDK Extensions: VSCode has several extensions specifically designed for CDK development, such as "AWS Toolkit" and "CDK Explorer". Install these extensions from the VSCode Extensions Marketplace to enhance your CDK development experience.

3.	Install Node.js: CDK is built on Node.js, so make sure you have Node.js installed on your development machine. You can download and install Node.js from the official website (https://nodejs.org/).

4.	Install CDK Toolkit: CDK Toolkit is a command-line interface (CLI) that is used to interact with CDK applications. Install it globally on your machine using npm (Node Package Manager) by running the command: "npm install -g aws-cdk".

5.	Create a blank CDK Project: In VSCode, create a new folder for your CDK project and open it in the editor. Use the CDK Toolkit to initialize a new CDK project by running the command: "cdk init --language <LANGUAGE>". Replace <LANGUAGE> with the programming language you want to use for your CDK project, such as "typescript" or "python". In this book we will primarily use typscript. 

Now that you have an environment, we can start building cloud applications using the power of IaC with CDK (almost). 

=== Set up your AWS Account

CDK is a construct built on Amazon Web Services. To deploy web resources you need an AWS account. You will generate access keys so you can access AWS services programatically. 

Here's a brief overview of how to set up an AWS account and generate access keys for development:

1.	Sign up for an AWS Account: Visit the AWS website (https://aws.amazon.com/) and click on the "Create an AWS Account" button to start the sign-up process. Follow the instructions to provide the required information, such as email address, password, and payment details.

2.	Provide Payment Information: AWS requires a valid payment method, such as a credit card, to verify your identity during the account setup process. You will not be charged unless you use paid services beyond the free tier. 

3.	Complete Identity Verification: As part of the account setup process, AWS may require additional identity verification, which can be done through phone verification or uploading identification documents.

4.	Create IAM User: IAM (Identity and Access Management) is a service in AWS that allows you to manage access to AWS resources. It is recommended to create an IAM user with appropriate permissions for development purposes. Follow the instructions to create an IAM user with programmatic access, and make sure to download the access keys provided during the process.

5.	Set up Access Keys: Once you have created an IAM user, you will receive access keys consisting of an access key ID and a secret access key. These keys are used for programmatic access to AWS services and should be kept secure. You can use these access keys in your development environment to interact with AWS services through APIs or SDKs.

6.	Enable Necessary AWS Services: Depending on your development requirements, you may need to enable specific AWS services in your AWS account. For example, if you plan to use AWS EC2 instances, you will need to enable EC2 service in your AWS account.

With your AWS account set up and access keys generated, you are now ready to start building and deploying applications using AWS services. 

=== Your first project

1.	Start Coding: You can now start writing your CDK code in VSCode. The AWS Toolkit extension provides helpful features like autocompletion, code snippets, and AWS-specific documentation to aid in your development process.
   
2.	Deploy CDK Stack: Once you have written your CDK code, you can use the CDK Toolkit to deploy your CDK stack to your desired cloud environment. Run the command: "cdk deploy" to create the resources defined in your CDK stack.
