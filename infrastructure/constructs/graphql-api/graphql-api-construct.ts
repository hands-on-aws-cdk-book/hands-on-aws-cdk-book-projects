import * as cdk from "aws-cdk-lib";
import { Expiration } from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as path from "path";
import * as cognito from "aws-cdk-lib/aws-cognito";

/** Configuration for a DynamoDB resolver */
interface ResolverConfig {
  /** GraphQL field name */
  fieldName: string;
  /** GraphQL type name (e.g., 'Query', 'Mutation') */
  typeName: string;
  /** DynamoDB operation (e.g., 'Query', 'GetItem') */
  operation: "Query" | "GetItem" | "PutItem" | "UpdateItem" | "DeleteItem";
  /** Key condition for Query operations */
  keyCondition?: {
    partitionKey: string;
    sortKey?: string;
  };
  /** Optional filter expression */
  filter?: {
    expression: string;
    expressionNames: { [key: string]: string };
    expressionValues: { [key: string]: string };
  };
  /** Custom request mapping template */
  customRequestTemplate?: string;
  /** Custom response mapping template */
  customResponseTemplate?: string;
}

/** Configuration for the GraphQL API construct */
export interface GraphqlApiConstructProps {
  /** DynamoDB table containing energy usage data */
  readonly table: dynamodb.Table;

  /** Optional API name */
  readonly apiName?: string;

  /** Optional schema file path */
  readonly schemaPath?: string;

  /** Resolver configurations */
  readonly resolvers: ResolverConfig[];

  /** Authentication configuration */
  readonly auth?: {
    userPool?: cognito.IUserPool;
    apiKey?: {
      expires: cdk.Duration;
    };
  };
}

/**
 * Creates an AppSync GraphQL API for querying energy usage data
 * with direct DynamoDB resolvers
 */
export class GraphqlApiConstruct extends Construct {
  /** The underlying AppSync GraphQL API */
  public readonly api: appsync.GraphqlApi;

  /** The API's URL */
  public readonly apiUrl: string;

  /** API Key (if enabled) */
  public readonly apiKey?: string;

  constructor(scope: Construct, id: string, props: GraphqlApiConstructProps) {
    super(scope, id);

    // Create the API with auth config
    this.api = new appsync.GraphqlApi(this, "Api", {
      name: props.apiName ?? "EnergyUsageApi",
      schema: appsync.SchemaFile.fromAsset(
        props.schemaPath ?? "schema.graphql"
      ),
      authorizationConfig: {
        defaultAuthorization: props.auth?.userPool
          ? {
              authorizationType: appsync.AuthorizationType.USER_POOL,
              userPoolConfig: {
                userPool: props.auth.userPool,
                defaultAction: appsync.UserPoolDefaultAction.ALLOW,
              },
            }
          : {
              authorizationType: appsync.AuthorizationType.API_KEY,
              apiKeyConfig: props.auth?.apiKey
                ? { expires: Expiration.after(props.auth.apiKey.expires) }
                : undefined,
            },
        // Add API key as additional auth if Cognito is primary
        additionalAuthorizationModes:
          props.auth?.userPool && props.auth?.apiKey
            ? [
                {
                  authorizationType: appsync.AuthorizationType.API_KEY,
                  apiKeyConfig: {
                    expires: Expiration.after(props.auth.apiKey.expires),
                  },
                },
              ]
            : undefined,
      },
    });

    // Create DynamoDB data source
    const dataSource = this.api.addDynamoDbDataSource(
      "EnergyUsageTable",
      props.table
    );

    // Create resolvers dynamically based on configuration
    this.createResolvers(dataSource, props.resolvers);

    // Set outputs
    this.apiUrl = this.api.graphqlUrl;
    if (props.auth?.apiKey) {
      this.apiKey = this.api.apiKey;
    }
  }

  private createResolvers(
    dataSource: appsync.DynamoDbDataSource,
    resolverConfigs: ResolverConfig[]
  ): void {
    resolverConfigs.forEach((config, index) => {
      const resolverId = `Resolver${index}`;

      let requestTemplate: appsync.MappingTemplate;
      if (config.customRequestTemplate) {
        requestTemplate = appsync.MappingTemplate.fromString(
          config.customRequestTemplate
        );
      } else if (config.operation === "Query") {
        requestTemplate = appsync.MappingTemplate.dynamoDbQuery(
          appsync.KeyCondition.eq(
            config.keyCondition!.partitionKey,
            config.keyCondition!.partitionKey
          ),
          config.filter ? config.filter : undefined
        );
      } else if (config.operation === "GetItem") {
        requestTemplate = appsync.MappingTemplate.dynamoDbGetItem(
          config.keyCondition!.partitionKey,
          config.keyCondition!.sortKey
        );
      }

      const responseTemplate = config.customResponseTemplate
        ? appsync.MappingTemplate.fromString(config.customResponseTemplate)
        : appsync.MappingTemplate.dynamoDbResultList();

      dataSource.createResolver(resolverId, {
        typeName: config.typeName,
        fieldName: config.fieldName,
        requestMappingTemplate: requestTemplate!,
        responseMappingTemplate: responseTemplate,
      });
    });
  }
}
