import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { RestApiConstruct } from "../../constructs/rest-api/rest-api-construct";
import { GraphqlApiConstruct } from "../../constructs/graphql-api/graphql-api-construct";
import * as path from "path";

interface EnergyApiStackProps extends cdk.StackProps {
  readonly calculatedEnergyTable: dynamodb.Table;
  readonly userPool?: cognito.IUserPool;
  readonly userPoolClient?: cognito.IUserPoolClient;
}

export class EnergyApiStack extends cdk.Stack {
  public readonly restApiEndpoint: string;
  public readonly graphqlApiEndpoint: string;
  public readonly graphqlApiKey?: string;

  constructor(scope: cdk.App, id: string, props: EnergyApiStackProps) {
    super(scope, id, props);

    // REST API Implementation
    const restApi = new RestApiConstruct(this, "EnergyRestApi", {
      table: props.calculatedEnergyTable,
      handlersPath: path.join(__dirname, "lambda"),
      apiName: "HomeEnergyCoachRESTAPI",
      description: "REST API for energy usage data",
      cors: {
        allowOrigins: ["*"], // Restrict in production
      },
      auth: {
        cognitoUserPool: props.userPool,
        apiKey: true,
      },
      operations: [
        {
          method: "GET",
          path: "/readings/{customerId}",
          name: "GetReadings",
          handlerFile: "get-readings",
          requestValidator: {
            requiredQueryParams: ["from", "to"],
            requiredHeaders: ["x-api-key"],
          },
        },
        {
          method: "GET",
          path: "/summary/{customerId}/{locationId}",
          name: "GetSummary",
          handlerFile: "get-summary",
          requestValidator: {
            requiredQueryParams: ["year", "month"],
            requiredHeaders: ["x-api-key"],
          },
        },
        {
          method: "GET",
          path: "/locations/{customerId}",
          name: "GetLocations",
          handlerFile: "get-locations",
          requestValidator: {
            requiredHeaders: ["x-api-key"],
          },
        },
      ],
    });

    // GraphQL API Implementation
    const graphqlApi = new GraphqlApiConstruct(this, "EnergyGraphQLApi", {
      table: props.calculatedEnergyTable,
      apiName: "HomeEnergyCoachGraphQLAPI",
      schemaPath: path.join(__dirname, "schema.graphql"),
      auth: {
        userPool: props.userPool,
        apiKey: {
          expires: cdk.Duration.days(365),
        },
      },
      resolvers: [
        {
          fieldName: "getEnergyReadings",
          typeName: "Query",
          operation: "Query",
          keyCondition: {
            partitionKey: "customerId",
          },
          filter: {
            expression:
              "locationId = :locationId AND #ts BETWEEN :from AND :to",
            expressionNames: {
              "#ts": "timestamp",
            },
            expressionValues: {
              ":locationId": "locationId",
              ":from": "from",
              ":to": "to",
            },
          },
        },
        {
          fieldName: "getEnergySummary",
          typeName: "Query",
          operation: "GetItem",
          customRequestTemplate: `
            #set($monthKey = $ctx.args.year + "-" + $util.padLeft($ctx.args.month, 2, "0"))
            {
              "version": "2018-05-29",
              "operation": "GetItem",
              "key": {
                "primaryKey": $util.dynamodb.toDynamoDBJson("$ctx.args.customerId#$ctx.args.locationId#$monthKey"),
                "timestamp": $util.dynamodb.toDynamoDBJson($util.time.nowISO8601())
              }
            }
          `,
          customResponseTemplate: `
            #if($ctx.error)
              $util.error($ctx.error.message, $ctx.error.type)
            #end
            #if(!$ctx.result)
              null
            #else
              $util.toJson($util.parseJson($ctx.result.summary))
            #end
          `,
        },
        {
          fieldName: "listCustomerLocations",
          typeName: "Query",
          operation: "Query",
          keyCondition: {
            partitionKey: "customerId",
          },
          customRequestTemplate: `
            {
              "version": "2018-05-29",
              "operation": "Query",
              "index": "CustomerIndex",
              "query": {
                "expression": "customerId = :customerId",
                "expressionValues": {
                  ":customerId": $util.dynamodb.toDynamoDBJson($ctx.args.customerId)
                }
              },
              "select": "ALL_PROJECTED_ATTRIBUTES"
            }
          `,
        },
      ],
    });

    // Store endpoints
    this.restApiEndpoint = restApi.api.url;
    this.graphqlApiEndpoint = graphqlApi.apiUrl;
    this.graphqlApiKey = graphqlApi.apiKey;

    // Stack outputs
    new cdk.CfnOutput(this, "RestApiEndpoint", {
      value: this.restApiEndpoint,
      description: "REST API Endpoint URL",
    });

    new cdk.CfnOutput(this, "GraphQLApiEndpoint", {
      value: this.graphqlApiEndpoint,
      description: "GraphQL API Endpoint URL",
    });

    if (this.graphqlApiKey) {
      new cdk.CfnOutput(this, "GraphQLApiKey", {
        value: this.graphqlApiKey,
        description: "GraphQL API Key",
      });
    }
  }
}
