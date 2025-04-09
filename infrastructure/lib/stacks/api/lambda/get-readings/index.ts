import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract parameters from the request
    const customerId = event.pathParameters?.customerId;
    const fromDate = event.queryStringParameters?.from;
    const toDate = event.queryStringParameters?.to;

    // Validate required parameters
    if (!customerId || !fromDate || !toDate) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Missing required parameters",
          required: ["customerId", "from", "to"],
        }),
      };
    }

    // Query DynamoDB for readings
    const params = {
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: "customerId = :customerId",
      FilterExpression: "#ts BETWEEN :from AND :to",
      ExpressionAttributeNames: {
        "#ts": "timestamp",
      },
      ExpressionAttributeValues: {
        ":customerId": customerId,
        ":from": fromDate,
        ":to": toDate,
      },
    };

    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        readings: result.Items?.map((item) => ({
          timestamp: item.timestamp,
          kWh: item.kWh,
          outsideTemp: item.outsideTemp,
          deviceStates: {
            electricVehicleCharging: item.electricVehicleCharging,
            hotWaterHeater: item.hotWaterHeater,
            poolPump: item.poolPump,
            heatPump: item.heatPump,
          },
        })),
        count: result.Count || 0,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
