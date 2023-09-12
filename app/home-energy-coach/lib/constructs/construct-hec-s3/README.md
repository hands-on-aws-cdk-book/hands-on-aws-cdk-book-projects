# ☁️ Home Energy Coach Custom S3 Infrastructure Construct

This construct `HecS3Construct` extends the default AWS CDK S3 bucket construct by integrating security, well-architected principles, and default configurations to align with the `cdk_nag` AWS specifications.

## 🚀 What It Does

`HecS3Construct` provides a pre-configured S3 bucket optimized for security and well-architected infrastructure. Key features include:

1. AWS-managed encryption.
2. Complete blocking of public access.
3. Enabled bucket versioning.
4. Automated object deletion.
5. Association with an access log bucket.
6. Cost-optimized lifecycle policies, transitioning objects based on access frequency.

## 🛠 How To Use

To leverage the `HecS3Construct`, import it and provide the necessary properties:

```typescript
import { HecS3Construct } from "path-to-construct";

const myBucket = new HecS3Construct(this, "MyBucketID", {
  bucketName: "MyCustomBucketName",
  cors: [
    {
      allowedMethods: [s3.HttpMethods.GET],
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
    },
  ],
  bucketLifeCyclePolicyArray: [
    // Custom lifecycle policies
  ],
  bucketStorageClass: true,
});
```

## ⚙️ Configuration Details

You can adjust the following configurations for the construct:

- bucketName: (Optional) Manual bucket naming.
- bucketLifeCyclePolicyArray: (Optional) Array of custom lifecycle rules, default is a cost-optimized policy.
- bucketStorageClass: (Optional) S3 storage class.
- cors: (Optional) Cross-origin resource sharing settings.
- versioned: (Optional) Enable or disable versioning.

## 📦 Additional Features

Key default implementations:

- AWS Encryption: The bucket data is encrypted using AWS-managed keys.
- Public Access Blocked: All public access is blocked, ensuring data privacy.
- Access Logging: An access log bucket is associated for monitoring requests to the S3 bucket.
- Lifecycle Policy: Cost-optimized policies are implemented, transitioning objects to S3 - Infrequent Access after 30 days and to Glacier Instant Retrieval after 90 days. Custom policies can be added or replace the default.

Continue building and stay secure 🔐, my friends! 🚧🔧🎉
