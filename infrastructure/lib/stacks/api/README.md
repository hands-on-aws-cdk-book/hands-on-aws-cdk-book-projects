# API Stack Documentation

## Overview

The API Stack provides a RESTful API for the Home Energy Coach application, enabling clients to access energy usage data and interact with the Q Business chatbot. The stack is built using AWS CDK and leverages AWS API Gateway and Lambda functions to create a serverless API architecture.

## Architecture

The API Stack consists of the following components:

- **API Gateway**: REST API with custom domain name and API key authentication
- **Lambda Functions**: Serverless functions that handle API requests
- **IAM Roles**: Permissions for Lambda functions to access other AWS resources
- **CloudWatch Logs**: Logging for API requests and Lambda function execution

## Authentication

The API supports two authentication methods:

1. **API Key Authentication**: Required for all endpoints
2. **Cognito User Pool Authentication**: Optional, can be enabled for user-specific endpoints

## API Endpoints

### Energy Usage Data Endpoints

#### GET /readings/{customerId}

Retrieves energy usage readings for a specific customer within a date range.

**Parameters:**

- `customerId` (path): The unique identifier for the customer
- `from` (query): Start date in ISO format (YYYY-MM-DD)
- `to` (query): End date in ISO format (YYYY-MM-DD)
- `x-api-key` (header): API key for authentication

**Response:**

```json
{
  "readings": [
    {
      "timestamp": "2023-01-01T00:00:00Z",
      "locationId": "loc-123",
      "kWh": 12.5,
      "cost": 2.5
    }
    // More readings...
  ]
}
```

#### GET /summary/{customerId}/{locationId}

Retrieves a summary of energy usage for a specific customer and location.

**Parameters:**

- `customerId` (path): The unique identifier for the customer
- `locationId` (path): The unique identifier for the location
- `year` (query): The year for the summary (e.g., 2023)
- `month` (query): The month for the summary (1-12)
- `x-api-key` (header): API key for authentication

**Response:**

```json
{
  "summary": {
    "totalKWh": 450.75,
    "totalCost": 90.15,
    "averageDailyKWh": 14.54,
    "peakUsageDay": "2023-01-15",
    "peakUsageKWh": 25.3
  }
}
```

### Chatbot Endpoint

#### POST /chat

Interacts with the Q Business chatbot to answer questions about energy usage.

**Parameters:**

- `x-api-key` (header): API key for authentication
- Request body:

```json
{
  "message": "How much energy did I use last month?",
  "customerId": "cust-123"
}
```

**Response:**

```json
{
  "response": "Based on your energy usage data, you consumed 450.75 kWh last month, which cost you $90.15. This is a 5% increase compared to the previous month."
}
```

## Environment Variables

The API Stack supports custom environment variables that can be passed to Lambda functions:

```typescript
customEnvironmentVariables: {
  Q_CHATBOT_ID: "chatbot-id",
  Q_CHATBOT_ENABLED: "true",
  // Add other environment variables as needed
}
```

## CORS Configuration

The API is configured with CORS support to allow cross-origin requests:

```typescript
cors: {
  allowOrigins: ["*"], // Restrict in production
}
```

## Deployment

The API Stack is deployed as part of the main CDK application:

```typescript
const apiStack = new ApiStack(app, `ApiStack`, {
  ...defaultStackProps,
  calculatedEnergyTable: sharedResourcesStack.calculatedEnergyTable,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  customEnvironmentVariables: {
    Q_CHATBOT_ID: chatbotStack.chatbot.chatbotId,
    Q_CHATBOT_ENABLED: "true",
  },
});
```

## Dependencies

The API Stack depends on:

- SharedResourcesStack (for DynamoDB table)
- AuthStack (for Cognito User Pool)
- ChatbotStack (for Q Business chatbot ID)

## Outputs

The API Stack outputs the following values:

- `RestApiEndpoint`: The URL of the REST API endpoint
- `GraphqlApiKey`: The API key for GraphQL API (if enabled)
