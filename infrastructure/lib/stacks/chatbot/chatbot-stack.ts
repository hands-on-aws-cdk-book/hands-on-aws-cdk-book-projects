import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ChatbotConstruct } from "../../constructs/chatbot/chatbot-construct";

interface ChatbotStackProps extends cdk.StackProps {
  readonly calculatedEnergyTable: dynamodb.Table;
}

export class ChatbotStack extends cdk.Stack {
  public readonly chatbot: ChatbotConstruct;

  constructor(scope: Construct, id: string, props: ChatbotStackProps) {
    super(scope, id, props);

    // Create a unique application name based on the stack ID
    const applicationName = `energy-coach-${this.stackName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}`;

    this.chatbot = new ChatbotConstruct(this, "EnergyCoachChatbot", {
      table: props.calculatedEnergyTable,
      applicationName: applicationName,
    });

    // Stack outputs
    new cdk.CfnOutput(this, "ChatbotId", {
      value: this.chatbot.chatbotId,
      description: "Amazon Q Business Application ID",
    });

    new cdk.CfnOutput(this, "KnowledgeBaseBucket", {
      value: this.chatbot.knowledgeBase.bucketName,
      description: "S3 Bucket for Knowledge Base",
    });
  }
}
