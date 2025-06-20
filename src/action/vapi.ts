"use server";

import { aiAgentPrompt } from "@/lib/data";
import { prismaClient } from "@/lib/prismaClient";
import { vapiServer } from "@/lib/vapi/vapiServer";
import { randomUUID } from "crypto";

export const createAssistant = async (name: string, userId: string, useDefaultAgent: boolean = true) => {
  console.log("🎯 Starting createAssistant server action:", {
    name,
    userId,
    useDefaultAgent,
    timestamp: new Date().toISOString()
  });

  try {
    // Generate our own ID since VAPI might not return one
    const assistantId = randomUUID();
    console.log("🆔 Generated assistant ID:", assistantId);
    
    const firstMessage = useDefaultAgent 
      ? `Hey! This is ${name} from our brand partnerships team. I've been checking out your content and I'm really excited to chat with you about an amazing 5-video campaign opportunity we have. Are you ready to hear about something that could be a perfect fit for your audience?`
      : `Hello! I'm ${name}, your AI assistant. How can I help you today?`;

    const systemPrompt = useDefaultAgent ? aiAgentPrompt : "";

    console.log("🤖 Preparing assistant configuration:", {
      assistantId,
      firstMessage: firstMessage.substring(0, 50) + "...",
      hasSystemPrompt: !!systemPrompt,
      timestamp: new Date().toISOString()
    });

    console.log("🌐 Creating assistant in VAPI...");
    await vapiServer.assistants.create({
      name: name,
      firstMessage: firstMessage,
      model: {
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
        temperature: 0.5,
      },
      serverMessages: [],
    });
    console.log("✅ VAPI assistant created successfully");

    console.log("💾 Creating assistant record in database...");
    const aiAgent = await prismaClient.aiAgents.create({
      data: {
        id: assistantId,
        model: "gpt-4o",
        provider: "openai",
        prompt: systemPrompt,
        name: name,
        firstMessage: firstMessage,
        userId: userId,
        User: {
          connect: {
            id: userId,
          },
        }
      },
    });
    console.log("✅ Database record created successfully:", {
      assistantId: aiAgent.id,
      name: aiAgent.name,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      status: 200,
      data: aiAgent,
    };
  } catch (error) {
    console.error("🔴 Error in createAssistant:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      status: 500,
      message: "Failed to create agent",
    };
  }
};

//update assistant
export const updateAssistant = async (
  assistantId: string,
  firstMessage: string,
  systemPrompt: string
) => {
  try {
    const updateAssistant = await vapiServer.assistants.update(assistantId, {
      firstMessage: firstMessage,
      model: {
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
      serverMessages: [],
    });
    console.log("Assistant updated:", updateAssistant);

    const updateAiAgent = await prismaClient.aiAgents.update({
      where: {
        id: assistantId,
      },
      data: {
        firstMessage: firstMessage,
        prompt: systemPrompt,
      },
    });

    return {
      success: true,
      status: 200,
      data: updateAiAgent,
    };
  } catch (error) {
    console.error("Error updating agent:", error);
    return {
      success: false,
      status: 500,
      error: error,
      message: "Failed to update agent",
    };
  }
};
