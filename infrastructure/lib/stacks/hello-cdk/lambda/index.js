const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client();

/**
 * Lambda function invoked on S3 object created event
 *
 * @param {Object} event - The S3 event data
 * @returns {Object} - The response including body and statusCode
 */
const main = async (event) => {
  console.log("Lambda function invoked");

  // Get bucket and object key from event
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  // Get object data from S3
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    // Convert stream to string
    const stream = response.Body;
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const name = buffer.toString("utf-8").trim();

    console.log(`Name extracted from S3 object: "${name}"`);

    // Print greeting with name
    const msg = `Hello, ${name}! I am your new energy assistant.`;
    console.log(`Greeting: ${msg}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: msg,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing request",
        error: error.message,
      }),
    };
  }
};

module.exports = { main };
