# Chat Lambda Function

This Lambda function provides a chat interface for interacting with AWS Bedrock's Claude model to answer questions about energy usage.

## Features

- Processes chat messages via API Gateway
- Integrates with AWS Bedrock's Claude v2 model
- Handles error cases and provides appropriate responses
- Includes CORS headers for frontend integration
- Optional integration with Q chatbot

## Installation

1. Install the required dependencies:

```bash
# From the infrastructure directory
npm install @aws-sdk/client-bedrock-runtime
```

## Usage

### API Endpoint

The chat endpoint is available at: `POST /chat`

### Request Format

```json
{
  "message": "What was my energy usage last month?"
}
```

### Response Format

```json
{
  "response": "The AI's response will be here...",
  "qChatbotEnabled": true,
  "qChatbotId": "chatbot-123456"
}
```

### Error Responses

- 400 Bad Request: Missing or invalid request body
- 500 Internal Server Error: Error processing the request

## Environment Variables

The Lambda function supports the following environment variables:

- `BEDROCK_REGION`: The AWS region where Bedrock is available (default: "us-east-1")
- `Q_CHATBOT_ENABLED`: Set to "true" to enable Q chatbot integration
- `Q_CHATBOT_ID`: The ID of the Q chatbot to use

## IAM Permissions

The Lambda function requires the following IAM permissions:

- `bedrock:InvokeModel`

## Testing

You can test the endpoint using curl:

```bash
curl -X POST https://your-api-endpoint/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What was my energy usage last month?"}'
```

## Development

1. Make changes to `index.ts`
2. Deploy using CDK:

```bash
cdk deploy ApiStack
```

## Security Considerations

- In production, restrict CORS origins to your frontend domain
- Consider adding authentication to the chat endpoint
- Restrict Bedrock permissions to specific model ARNs
- Implement rate limiting for the API
