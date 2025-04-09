import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract parameters from the request
    const customerId = event.pathParameters?.customerId;
    const locationId = event.pathParameters?.locationId;
    const year = event.queryStringParameters?.year;
    const month = event.queryStringParameters?.month;

    // Validate required parameters
    if (!customerId || !locationId || !year || !month) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Missing required parameters",
          required: ["customerId", "locationId", "year", "month"],
        }),
      };
    }

    // Format month key and query DynamoDB
    const monthKey = `${year}-${month.padStart(2, "0")}`;
    const params = {
      TableName: process.env.TABLE_NAME!,
      Key: {
        customerId: customerId,
        monthKey: `${locationId}#${monthKey}`,
      },
    };

    const result = await dynamodb.get(params).promise();

    // Calculate summary if no existing summary found
    if (!result.Item) {
      // Get all readings for the month
      const readingsParams = {
        TableName: process.env.TABLE_NAME!,
        KeyConditionExpression: "customerId = :customerId",
        FilterExpression:
          "#ts BETWEEN :start AND :end AND locationId = :locationId",
        ExpressionAttributeNames: {
          "#ts": "timestamp",
        },
        ExpressionAttributeValues: {
          ":customerId": customerId,
          ":locationId": locationId,
          ":start": `${monthKey}-01 00:00`,
          ":end": `${monthKey}-31 23:59`,
        },
      };

      const readingsResult = await dynamodb.query(readingsParams).promise();

      if (readingsResult.Items && readingsResult.Items.length > 0) {
        const totalKWh = readingsResult.Items.reduce(
          (sum, item) => sum + item.kWh,
          0
        );
        const avgTemp =
          readingsResult.Items.reduce(
            (sum, item) => sum + item.outsideTemp,
            0
          ) / readingsResult.Items.length;

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            summary: {
              month: monthKey,
              totalKWh: Number(totalKWh.toFixed(2)),
              averageTemperature: Number(avgTemp.toFixed(1)),
              readingCount: readingsResult.Items.length,
            },
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        summary: result.Item || null,
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
