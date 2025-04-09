import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface ChatbotConstructProps {
  readonly table: dynamodb.Table;
  readonly applicationName: string;
  readonly identityCenterInstanceArn: string;
  readonly knowledgeBaseBucket: s3.Bucket;
}

export class ChatbotConstruct extends Construct {
  public readonly chatbotId: string;
  public readonly knowledgeBase: s3.Bucket;

  constructor(scope: Construct, id: string, props: ChatbotConstructProps) {
    super(scope, id);

    // Use the provided knowledge base bucket
    this.knowledgeBase = props.knowledgeBaseBucket;

    // Create the data source role
    const dataSourceRole = new iam.Role(this, "DataSourceRole", {
      assumedBy: new iam.ServicePrincipal("qbusiness.amazonaws.com"),
      inlinePolicies: {
        s3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["s3:GetObject", "s3:ListBucket"],
              resources: [
                this.knowledgeBase.bucketArn,
                `${this.knowledgeBase.bucketArn}/*`,
              ],
            }),
          ],
        }),
      },
    });

    // Create the application role
    const applicationRole = new iam.Role(this, "ApplicationRole", {
      assumedBy: new iam.ServicePrincipal("qbusiness.amazonaws.com"),
      inlinePolicies: {
        indexAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["qbusiness:GetIndex", "qbusiness:ListIndices"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // Create the AWS custom resource for Q Business application
    const application = new cr.AwsCustomResource(this, "ApplicationResource", {
      onCreate: {
        service: "QBusiness",
        action: "createApplication",
        parameters: {
          displayName: props.applicationName,
          description: "Energy usage assistant powered by Amazon Q Business",
          roleArn: applicationRole.roleArn,
          identityType: "AWS_IAM_IDC",
          identityCenterInstanceArn: props.identityCenterInstanceArn,
          attachmentsConfiguration: {
            attachmentsControlMode: "DISABLED",
          },
          qAppsConfiguration: {
            qAppsControlMode: "DISABLED",
          },
          personalizationConfiguration: {
            personalizationControlMode: "DISABLED",
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-app`
        ),
      },
      onUpdate: {
        service: "QBusiness",
        action: "updateApplication",
        parameters: {
          applicationId: cr.PhysicalResourceId.of(
            `${props.applicationName}-app`
          ).toString(),
          displayName: props.applicationName,
          description: "Energy usage assistant powered by Amazon Q Business",
          roleArn: applicationRole.roleArn,
          identityType: "AWS_IAM_IDC",
          identityCenterInstanceArn: props.identityCenterInstanceArn,
          attachmentsConfiguration: {
            attachmentsControlMode: "DISABLED",
          },
          qAppsConfiguration: {
            qAppsControlMode: "DISABLED",
          },
          personalizationConfiguration: {
            personalizationControlMode: "DISABLED",
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-app`
        ),
      },
      onDelete: {
        service: "QBusiness",
        action: "deleteApplication",
        parameters: {
          applicationId: cr.PhysicalResourceId.of(
            `${props.applicationName}-app`
          ).toString(),
        },
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: [
            "qbusiness:CreateApplication",
            "qbusiness:UpdateApplication",
            "qbusiness:DeleteApplication",
            "iam:PassRole",
          ],
          resources: ["*"],
        }),
      ]),
    });

    // Store the application ID for use in other resources
    const applicationId = application.getResponseField("applicationId");

    // Create the AWS custom resource for Q Business index
    const index = new cr.AwsCustomResource(this, "IndexResource", {
      onCreate: {
        service: "QBusiness",
        action: "createIndex",
        parameters: {
          applicationId: applicationId,
          displayName: `${props.applicationName}-index`,
          description: "Energy usage knowledge index",
          type: "STARTER",
          capacityConfiguration: {
            units: 1,
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-index`
        ),
      },
      onUpdate: {
        service: "QBusiness",
        action: "updateIndex",
        parameters: {
          applicationId: applicationId,
          indexId: cr.PhysicalResourceId.of(
            `${props.applicationName}-index`
          ).toString(),
          displayName: `${props.applicationName}-index`,
          description: "Energy usage knowledge index",
          capacityConfiguration: {
            units: 1,
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-index`
        ),
      },
      onDelete: {
        service: "QBusiness",
        action: "deleteIndex",
        parameters: {
          applicationId: applicationId,
          indexId: cr.PhysicalResourceId.of(
            `${props.applicationName}-index`
          ).toString(),
        },
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: [
            "qbusiness:CreateIndex",
            "qbusiness:UpdateIndex",
            "qbusiness:DeleteIndex",
            "iam:PassRole",
          ],
          resources: ["*"],
        }),
      ]),
    });

    // Store the index ID for use in other resources
    const indexId = index.getResponseField("indexId");

    // Create the AWS custom resource for Q Business data source
    const dataSource = new cr.AwsCustomResource(this, "DataSourceResource", {
      onCreate: {
        service: "QBusiness",
        action: "createDataSource",
        parameters: {
          applicationId: applicationId,
          indexId: indexId,
          displayName: `${props.applicationName}-datasource`,
          description: "Energy usage data source",
          configuration: {
            s3Configuration: {
              bucketArn: this.knowledgeBase.bucketArn,
              inclusionPrefixes: ["energy-data/"],
            },
          },
          roleArn: dataSourceRole.roleArn,
          syncSchedule: "ONE_TIME",
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-datasource`
        ),
      },
      onUpdate: {
        service: "QBusiness",
        action: "updateDataSource",
        parameters: {
          applicationId: applicationId,
          indexId: indexId,
          dataSourceId: cr.PhysicalResourceId.of(
            `${props.applicationName}-datasource`
          ).toString(),
          displayName: `${props.applicationName}-datasource`,
          description: "Energy usage data source",
          configuration: {
            s3Configuration: {
              bucketArn: this.knowledgeBase.bucketArn,
              inclusionPrefixes: ["energy-data/"],
            },
          },
          roleArn: dataSourceRole.roleArn,
          syncSchedule: "ONE_TIME",
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-datasource`
        ),
      },
      onDelete: {
        service: "QBusiness",
        action: "deleteDataSource",
        parameters: {
          applicationId: applicationId,
          indexId: indexId,
          dataSourceId: cr.PhysicalResourceId.of(
            `${props.applicationName}-datasource`
          ).toString(),
        },
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: [
            "qbusiness:CreateDataSource",
            "qbusiness:UpdateDataSource",
            "qbusiness:DeleteDataSource",
            "iam:PassRole",
          ],
          resources: ["*"],
        }),
      ]),
    });

    // Store the data source ID for use in the sync job
    const dataSourceId = dataSource.getResponseField("dataSourceId");

    // Start the data source sync job
    new cr.AwsCustomResource(this, "SyncJobResource", {
      onCreate: {
        service: "QBusiness",
        action: "startDataSourceSyncJob",
        parameters: {
          applicationId: applicationId,
          indexId: indexId,
          dataSourceId: dataSourceId,
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `${props.applicationName}-sync-job`
        ),
      },
      onDelete: {
        service: "QBusiness",
        action: "stopDataSourceSyncJob",
        parameters: {
          applicationId: applicationId,
          indexId: indexId,
          dataSourceId: dataSourceId,
        },
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: [
            "qbusiness:StartDataSourceSyncJob",
            "qbusiness:StopDataSourceSyncJob",
          ],
          resources: ["*"],
        }),
      ]),
    });

    // Grant read access to DynamoDB
    props.table.grantReadData(application);

    this.chatbotId = props.applicationName;
  }
}
