[[first_application]]

== Your first CDK applications

In this chapter you will learn to build a simple single-component CDK application using Amazon S3 so that you can practice deploying and changing an application. In this hands-on tutorial chapter you will write a CDK stack using an L2 construct, deploy it, change it, and deploy again. You will also learn how to write in-line documentation using JSDocs.

- Deploy an S3 bucket
- Change the bucket
- Document your code
- Review what you built
- What comes next

=== Deploy an S3 bucket

Here's an example of a single component CDK application using Python that deploys an S3 bucket using AWS CDK (Cloud Development Kit):

[source,typescript]
----
    from aws_cdk import core
    import aws_cdk.aws_s3 as s3
    
    class S3BucketStack(core.Stack):
        def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
            super().__init__(scope, id, **kwargs)
    
            # Create an S3 bucket
            my_bucket = s3.Bucket(
                self, 'MyBucket',
                bucket_name='my-s3-bucket' # Replace with desired bucket name
            )
    
    app = core.App()
    S3BucketStack(app, 'S3BucketStack')
    app.synth()
----

Explanation:
1.	The aws_cdk library is imported, which is the core module of the CDK framework.
2.	A new stack (S3BucketStack) is defined, which inherits from core.Stack, representing a stack of AWS resources.
3.	Inside the S3BucketStack class, an S3 bucket is created using the s3.Bucket class from the aws_cdk.aws_s3 module.
4.	The bucket_name property is set to the desired name for the S3 bucket. You can replace 'my-s3-bucket' with your preferred bucket name.
5.	Finally, an instance of the S3BucketStack class is created, passing it the app object, which represents the CDK application, and a stack name ('S3BucketStack').
6.	The app.synth() method generates the CloudFormation template for the CDK application, which can be deployed using cdk deploy command in the terminal.
Note: Before running the CDK application, make sure you have installed the necessary dependencies and configured your AWS credentials. You can use the cdk init command to initialize a new CDK application and cdk synth command to generate the CloudFormation template for the application.

=== Change your application

Let's modify the previous example of the CDK application that deploys an S3 bucket to add additional properties and configuration:

[source,typescript]
----
    from aws_cdk import core
    import aws_cdk.aws_s3 as s3
    
    class S3BucketStack(core.Stack):
        def __init__(self, scope: core.Construct, id: str, bucket_name: str, **kwargs) -> None:
            super().__init__(scope, id, **kwargs)
    
            # Create an S3 bucket
            my_bucket = s3.Bucket(
                self, 'MyBucket',
                bucket_name=bucket_name,
                versioned=True,  # Enable versioning for the bucket
                encryption=s3.BucketEncryption.S3_MANAGED,  # Enable S3-managed encryption
                block_public_access=s3.BlockPublicAccess.BLOCK_ALL,  # Block public access to the bucket
                removal_policy=core.RemovalPolicy.DESTROY  # Delete the bucket when the CloudFormation stack is deleted
            )
    
    app = core.App()
    S3BucketStack(app, 'S3BucketStack', bucket_name='my-s3-bucket')
    app.synth()
----


Explanation:
1.	The bucket_name parameter is passed as an argument to the S3BucketStack class constructor, allowing you to specify the desired bucket name when creating the stack.
2.	Additional properties are set on the Bucket resource, such as versioned to enable versioning, encryption to specify S3-managed encryption, block_public_access to block public access to the bucket, and removal_policy to specify the removal policy for the bucket when the CloudFormation stack is deleted.
3.	When creating an instance of the S3BucketStack class, the bucket_name parameter is passed as an argument with the desired bucket name, such as 'my-s3-bucket'.

4.	The app.synth() method is used to generate the updated CloudFormation template for the CDK application.

After making these changes, you can deploy the modified CDK application using the cdk deploy command, and it will create an S3 bucket with the specified properties and configuration.

=== Document your code

Here's an example of how you can document your CDK project using JSDocs, which is a popular documentation format for JavaScript projects:

[source,typescript]
----
    from aws_cdk import core 
    import aws_cdk.aws_s3 as s3 
    
    class S3BucketStack(core.Stack): 
     """ CDK stack for deploying an S3 bucket. """ 
    
        def __init__(self, scope: core.Construct, id: str, bucket_name: str, **kwargs) -> None: 
        """ Constructor for the S3BucketStack class. Args: scope (core.Construct): The CDK construct scope for the stack. id (str): The ID of the stack. bucket_name (str): The name of the S3 bucket to be created. **kwargs: Additional keyword arguments for the stack. """ 
    
             super().__init__(scope, id, **kwargs) 
             # Create an S3 bucket 
              my_bucket = s3.Bucket( self, 'MyBucket', bucket_name=bucket_name,  versioned=True, # Enable versioning for the bucket
            encryption=s3.BucketEncryption.S3_MANAGED, # Enable S3-managed encryption  
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL, # Block public access to the bucket 
            removal_policy=core.RemovalPolicy.DESTROY # Delete the bucket when the CloudFormation stack is deleted
            )
----

Explanation:
* The JSDoc comments are placed above the class declaration and method declarations, providing a description of the class and its methods.
* The @param tag is used to document the parameters of the constructor, indicating the type and purpose of each parameter.
* The @returns tag can be used to document the return value of a method, if applicable.
* The @throws tag can be used to document any exceptions that may be thrown by a method, if applicable.
* The @example tag can be used to provide usage examples for the class or its methods.

You can use similar JSDoc comments to document other parts of your CDK project, such as additional classes, methods, or any custom configurations. Proper documentation helps improve the understandability and maintainability of your CDK project, making it easier for other developers to work with and extend in the future.



=== What you built

CDK lets you to define cloud resources using familiar programming languages. You created an S3 bucket that we can store objects in! Next we will create some objects to put in our bucket. 

Let's take a closer look at the architecture of the CDK application. CDK apps consist of the following components:

1.	CDK Core: This is the core module of the CDK framework that provides the foundation for defining cloud resources using the supported programming language (e.g., TypeScript, Java, Python, etc.). It allows developers to define the desired infrastructure components, such as AWS resources, in their preferred programming language using classes, methods, and properties.

2.	AWS CloudFormation: CDK is built on AWS CloudFormation. CloudFormation is a service that allows you to define, provision, and manage AWS resources using JSON or YAML templates. The CDK application generates CloudFormation templates based on the code written using the CDK Core.

3.	AWS Services: The CDK application can utilize various AWS services, depending on the requirements of the application. This can include services like Amazon S3 for storage, Amazon RDS for databases, Amazon EC2 for virtual machines, AWS Lambda for serverless computing, Amazon API Gateway for API management, and more. The CDK application will define and configure these AWS resources using the CDK Core.

4.	Application Logic: The CDK application may include application-specific logic written in the chosen programming language. This can include business logic, application configuration, and other custom code required for the application's functionality.

5.	Deployment Pipeline: The CDK application can be integrated with a CI/CD (Continuous Integration/Continuous Deployment) pipeline for automated deployment and updates. This can include tools like AWS CodePipeline, AWS CodeBuild, and AWS CodeDeploy to automatically build, test, and deploy the CDK application to the desired AWS environment.

6.	Infrastructure as Code (IaC): The CDK application's architecture follows the IaC approach, where the entire infrastructure is defined as code. This allows for versioning, code review, and repeatable deployments, making it easier to manage and maintain the infrastructure.

The CDK application architecture leverages the CDK framework, AWS CloudFormation, and various AWS services to define, deploy, and manage cloud resources in an automated and programmatic manner. The application logic is included as custom code within the CDK application, and the entire infrastructure is managed as code using the IaC approach.

=== The architecture of CDK Applications

Our first project is really simple. The rest of the book builds on this foundation. Here is a sneek peek and where we are going. 

Application Architecture:
1.	Frontend: The frontend of the application can be built using AWS Amplify, a set of tools and libraries for building web and mobile applications. Amplify provides features such as authentication, API management, storage, and UI components to simplify frontend development.

2.	Backend: The backend of the application can be built using AWS Lambda, a serverless compute service, along with AWS API Gateway for creating RESTful APIs. Lambda allows for writing serverless functions in various programming languages, and API Gateway allows for creating APIs that can trigger Lambda functions in response to API requests.

3.	Database: The application can utilize Amazon DynamoDB, a managed NoSQL database service, for storing data. DynamoDB provides scalable, fully managed, and low-latency access to data, making it suitable for modern applications.

4.	Storage: For storing files and other objects, Amazon S3, a scalable and durable object storage service, can be used. S3 provides features such as data durability, versioning, and fine-grained access control for securely storing and retrieving files.

Deployment Pathway:
1.	Development: Developers can use AWS CloudFormation, a service for defining and provisioning infrastructure as code, along with AWS CDK, to define the application infrastructure and deploy it to a development environment. This can be integrated with a version control system like Git for code versioning and collaboration.

2.	Testing: After development, the application can be tested in a staging environment. This can be achieved using AWS CloudFormation and CDK to create a separate staging stack with the same infrastructure as the production environment, allowing for thorough testing of the application's functionality, performance, and scalability.

3.	Production: Once testing is complete, the application can be deployed to the production environment. This can be done using AWS CloudFormation and CDK to create a production stack with the desired infrastructure configuration, and also leveraging AWS deployment tools such as AWS CodePipeline and AWS CodeDeploy for automated and controlled deployments.

4.	Monitoring: Throughout the application's lifecycle, monitoring and logging can be achieved using services such as Amazon CloudWatch, which provides monitoring, logging, and alerting capabilities for various AWS resources. This allows for real-time visibility into the application's performance and health.

The application architecture uses AWS services such as Amplify, Lambda, API Gateway, DynamoDB, and S3, and follows a deployment pathway that involves development, testing, and production environments using AWS CloudFormation, CDK, CodePipeline, and CodeDeploy. We use CloudWatch to monitor and control the app. It provides insights into the application's performance and health.
