import { aws_appsync as appsync } from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

/**
 * Props for ConstructGraphQLApi.
 */
export interface ConstructApiGraphQLProps extends cdk.StackProps {
  /**
   * Provided DynamoDB table.
   * @type {dynamodb.Table}
   */
  table: dynamodb.Table;

  /**
   * Schema file path for the GraphQL API.
   * Defaults to 'schema.graphql' in the current directory.
   * @type {string}
   */
  schemaFilePath?: string;

  /**
   * Name for the GraphQL API.
   * @type {string}
   */
  apiName?: string;
}

export class ConstructApiGraphQL extends Construct {
  constructor(scope: Construct, id: string, props: ConstructApiGraphQLProps) {
    super(scope, id);

    // Create GraphQL API
    const api = new appsync.GraphQLApi(this, "Api", {
      name: props.apiName || "customApi",
      definition: appsync.SchemaDefinition.fromAsset(
        props.schemaFilePath || path.join(__dirname, "schema.graphql")
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      xrayEnabled: true,
    });

    // Add provided DynamoDB table as a data source
    const dataSource = api.addDynamoDbDataSource("DataSource", props.table);

    // Resolver for the Query "getEnergyData" that retrieves data from the DynamoDB table.
    dataSource.createResolver("QueryGetEnergyDataResolver", {
      typeName: "Query",
      fieldName: "getEnergyData",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }
}
