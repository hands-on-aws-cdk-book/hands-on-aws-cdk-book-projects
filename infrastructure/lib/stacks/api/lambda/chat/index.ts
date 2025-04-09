import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { QBusinessClient, ChatCommand } from "@aws-sdk/client-qbusiness";

// Get the Bedrock region from environment variables or use default
const bedrockRegion = process.env.BEDROCK_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region: bedrockRegion });

// Initialize Q Business client
const qBusiness = new QBusinessClient({ region: process.env.AWS_REGION });

// Check if Q Business chatbot is enabled
const qChatbotEnabled = process.env.Q_CHATBOT_ENABLED === "true";
const qChatbotId = process.env.Q_CHATBOT_ID;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing message in request body" }),
      };
    }

    let responseText = "";

    // If Q Business chatbot is enabled, use it
    if (qChatbotEnabled && qChatbotId) {
      try {
        // Create a chat command for Q Business
        const chatCommand = new ChatCommand({
          applicationId: qChatbotId,
          messages: [
            {
              text: message,
              type: "USER",
            },
          ],
        });

        // Send the chat command to Q Business
        const chatResponse = await qBusiness.send(chatCommand);

        // Extract the response text
        if (
          chatResponse.output &&
          chatResponse.output.messages &&
          chatResponse.output.messages.length > 0
        ) {
          responseText = chatResponse.output.messages[0].text || "";
        }
      } catch (qError) {
        console.error("Error using Q Business:", qError);
        // Fall back to Bedrock if Q Business fails
      }
    }

    // If Q Business is not enabled or failed, use Bedrock
    if (!responseText) {
      // Prepare the prompt for Bedrock
      const prompt = `You are a helpful energy usage assistant. Please help with the following question: ${message}`;

      // Invoke the Bedrock model
      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-v2",
        body: JSON.stringify({
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 500,
          temperature: 0.7,
          top_p: 0.9,
        }),
        contentType: "application/json",
      });

      const response = await bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      responseText = responseBody.completion;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        response: responseText,
        qChatbotEnabled,
        qChatbotId: qChatbotEnabled ? qChatbotId : undefined,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
