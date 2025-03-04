import { S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { parse } from "csv-parse/sync";

const s3Client = new S3Client({});

export const main = async (event: S3Event): Promise<void> => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    // Get the CSV file from S3
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const csvData = await response.Body?.transformToString();
    if (!csvData) throw new Error("No CSV data found");

    // Parse CSV to JSON
    const records: any[] = parse(csvData, {
      columns: true,
      cast: (value, context) => {
        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;
        if (
          !isNaN(Number(value)) &&
          ![
            "customerId",
            "locationId",
            "address",
            "city",
            "state",
            "postalCode",
            "timestamp",
          ].includes(context.column as string)
        ) {
          return parseFloat(value);
        }
        return value;
      },
    });

    if (!records.length) throw new Error("No records found in CSV");

    // Extract identifiers from first record
    const firstRecord = records[0];
    const timestamp = new Date(firstRecord.timestamp);
    const monthYear = `${timestamp.getFullYear()}-${String(
      timestamp.getMonth() + 1
    ).padStart(2, "0")}`;

    // Create normalized JSON filename
    const jsonKey = `${firstRecord.customerId}/${firstRecord.locationId}/${monthYear}/energy-data.json`;

    // Upload the JSON file to the destination bucket
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.transformedToJsonBucket!,
        Key: jsonKey,
        Body: JSON.stringify(records, null, 2),
        ContentType: "application/json",
        Metadata: {
          customerId: firstRecord.customerId,
          locationId: firstRecord.locationId,
          month: monthYear,
          recordCount: records.length.toString(),
        },
      })
    );

    console.log(
      `Successfully transformed CSV to JSON and uploaded to ${jsonKey}`
    );
  } catch (error) {
    console.error("Error processing file:", error);
    throw error;
  }
};
