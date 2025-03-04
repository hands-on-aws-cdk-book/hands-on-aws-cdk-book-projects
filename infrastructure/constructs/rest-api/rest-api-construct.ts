import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import * as path from "path";

/** Configuration for a single API operation */
interface ApiOperation {
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** API path (/energy-data, /customers, etc.) */
  path: string;
  /** Operation name (used for Lambda function naming) */
  name: string;
  /** Lambda handler file name (without .ts extension) */
  handlerFile: string;
  /** Optional Lambda environment variables */
  environment?: { [key: string]: string };
  /** Optional request validator */
  requestValidator?: {
    /** Request body JSON schema */
    bodySchema?: { [key: string]: any };
    /** Required query string parameters */
    requiredQueryParams?: string[];
    /** Required request headers */
    requiredHeaders?: string[];
  };
}

/** Configuration for the REST API construct */
export interface RestApiConstructProps {
  /** DynamoDB table for data access */
  readonly table: dynamodb.Table;
  /** List of API operations to create */
  readonly operations: ApiOperation[];
  /** Optional API name */
  readonly apiName?: string;
  /** Optional API description */
  readonly description?: string;
  /** Base directory for Lambda handlers */
  readonly handlersPath: string;
  /** Optional CORS configuration */
  readonly cors?: {
    allowOrigins: string[];
    allowMethods?: string[];
    allowHeaders?: string[];
  };
  auth?: {
    cognitoUserPool?: cognito.IUserPool;
    apiKey?: boolean;
  };
}

/** Creates a REST API with Lambda integrations for each operation */
export class RestApiConstruct extends Construct {
  /** The underlying API Gateway REST API */
  public readonly api: apigateway.RestApi;
  /** Map of operation names to their Lambda functions */
  public readonly lambdas: { [key: string]: lambda.Function } = {};

  constructor(scope: Construct, id: string, props: RestApiConstructProps) {
    super(scope, id);

    // Create the REST API
    this.api = new apigateway.RestApi(this, "RestApi", {
      restApiName: props.apiName ?? "EnergyUsageApi",
      description: props.description ?? "API for energy usage data",
      defaultCorsPreflightOptions: props.cors
        ? {
            allowOrigins: props.cors.allowOrigins,
            allowMethods: props.cors.allowMethods ?? [
              "GET",
              "POST",
              "PUT",
              "DELETE",
            ],
            allowHeaders: props.cors.allowHeaders ?? ["*"],
          }
        : undefined,
    });

    // Create Cognito authorizer if provided
    let authorizer: apigateway.IAuthorizer | undefined;
    if (props.auth?.cognitoUserPool) {
      authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this,
        "CognitoAuthorizer",
        {
          cognitoUserPools: [props.auth.cognitoUserPool],
        }
      );
    }

    // Create models for request validation
    const models: { [key: string]: apigateway.Model } = {};

    // Create each operation
    props.operations.forEach((operation) => {
      // Create the Lambda function
      const lambda = new lambda.Function(this, `${operation.name}Function`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(props.handlersPath, operation.handlerFile)
        ),
        environment: {
          TABLE_NAME: props.table.tableName,
          ...operation.environment,
        },
      });

      // Grant table permissions to Lambda
      props.table.grantReadWriteData(lambda);

      // Store Lambda reference
      this.lambdas[operation.name] = lambda;

      // Create request validator if needed
      let validator: apigateway.RequestValidator | undefined;
      if (operation.requestValidator) {
        // Create model for body validation
        if (operation.requestValidator.bodySchema) {
          models[operation.name] = this.api.addModel(`${operation.name}Model`, {
            contentType: "application/json",
            modelName: `${operation.name}Model`,
            schema: {
              type: apigateway.JsonSchemaType.OBJECT,
              properties: operation.requestValidator.bodySchema,
            },
          });
        }

        validator = new apigateway.RequestValidator(
          this,
          `${operation.name}Validator`,
          {
            restApi: this.api,
            validateRequestBody: !!operation.requestValidator.bodySchema,
            validateRequestParameters: !!(
              operation.requestValidator.requiredQueryParams?.length ||
              operation.requestValidator.requiredHeaders?.length
            ),
          }
        );
      }

      // Add the API resource and method
      const resource = this.api.root.resourceForPath(operation.path);
      const methodOptions: apigateway.MethodOptions = {
        apiKeyRequired: props.auth?.apiKey,
        authorizer: authorizer,
        authorizationType: authorizer
          ? apigateway.AuthorizationType.COGNITO
          : props.auth?.apiKey
          ? apigateway.AuthorizationType.IAM
          : apigateway.AuthorizationType.NONE,
        requestValidator: validator,
        requestModels: operation.requestValidator?.bodySchema
          ? { "application/json": models[operation.name] }
          : undefined,
        requestParameters: {
          ...operation.requestValidator?.requiredQueryParams?.reduce(
            (acc, param) => ({
              ...acc,
              [`method.request.querystring.${param}`]: true,
            }),
            {}
          ),
          ...operation.requestValidator?.requiredHeaders?.reduce(
            (acc, header) => ({
              ...acc,
              [`method.request.header.${header}`]: true,
            }),
            {}
          ),
        },
      };

      resource.addMethod(
        operation.method,
        new apigateway.LambdaIntegration(lambda),
        methodOptions
      );
    });
  }
}
