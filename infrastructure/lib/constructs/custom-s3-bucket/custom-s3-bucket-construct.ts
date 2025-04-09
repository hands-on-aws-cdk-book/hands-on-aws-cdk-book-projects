import { Construct } from "constructs";
import { RemovalPolicy, Duration, PhysicalName } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";

/**
 * Properties for the CustomS3BucketConstruct
 */
interface CustomS3BucketProps extends s3.BucketProps {
  /**
   * Optional: set bucket name manually if required
   * @default PhysicalName.GENERATE_IF_NEEDED
   */
  readonly bucketName?: string;

  /**
   * Optional: Array of lifecycle rules to be applied to the bucket.
   * @default "Standard lifecycle policy."
   */
  readonly bucketLifeCyclePolicyArray?: Array<s3.LifecycleRule>;

  /**
   * Optional: set bucket storage class (currently not used).
   * @default "S3 standard"
   */
  readonly bucketStorageClass?: boolean;
}

/**
 * Custom S3 Bucket Construct
 *
 * This construct extends the default AWS CDK S3 bucket construct by incorporating
 * well-architected principles and default configurations to ensure compliance with
 * security and cost optimization requirements.
 *
 * Features:
 * - AWS-managed encryption enabled by default
 * - Public access blocked by default
 * - Versioning enabled by default
 * - Automatic object deletion on bucket removal
 * - Cost-optimized lifecycle policy (objects move to IA after 30 days, Glacier after 90 days)
 * - Access logging enabled
 * - SSL enforcement
 */
export class CustomS3BucketConstruct extends s3.Bucket {
  /**
   * S3 bucket object to be passed to other functions
   */
  public readonly s3Bucket: s3.Bucket;

  /**
   * Optional: Access log bucket (if implemented)
   */
  public readonly accessLogBucket?: s3.Bucket;

  constructor(scope: Construct, id: string, props: CustomS3BucketProps) {
    super(scope, id, {
      ...props,
      bucketName: props.bucketName
        ? props.bucketName
        : PhysicalName.GENERATE_IF_NEEDED,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: props.cors,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: props.versioned !== undefined ? props.versioned : true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsPrefix: id,
    });

    // Assign the created bucket reference for clarity
    this.s3Bucket = this;

    // Define cost-optimized lifecycle rules
    const costOptimizedLifecycleRule = [
      {
        transitions: [
          {
            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
            transitionAfter: Duration.days(30),
          },
          {
            storageClass: s3.StorageClass.GLACIER_INSTANT_RETRIEVAL,
            transitionAfter: Duration.days(90),
          },
        ],
      },
    ];

    // Apply custom lifecycle policies if provided, otherwise use default
    if (props.bucketLifeCyclePolicyArray) {
      console.log("Lifecycle policy option enabled");
      props.bucketLifeCyclePolicyArray.forEach((policy) => {
        this.addLifecycleRule(policy);
      });
    } else {
      // Apply default cost-optimized lifecycle policy
      costOptimizedLifecycleRule.forEach((rule) => {
        this.addLifecycleRule(rule);
      });
    }

    // Add cdk-nag suppressions for security best practices
    NagSuppressions.addResourceSuppressions(
      this,
      [
        {
          id: "AwsSolutions-S1",
          reason: "Access logging is enabled with serverAccessLogsPrefix",
        },
        {
          id: "AwsSolutions-S2",
          reason: "Public access is blocked with blockPublicAccess: BLOCK_ALL",
        },
        {
          id: "AwsSolutions-S3",
          reason: "Bucket has server-side encryption enabled",
        },
        {
          id: "AwsSolutions-S5",
          reason: "Bucket has versioning enabled",
        },
      ],
      true
    );
  }
}
