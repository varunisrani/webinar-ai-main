"use client";

import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { Bot, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { vapi } from "@/lib/vapi/vapiClient";
import { WebinarWithPresenter } from "@/lib/type";

type AIAgentChatIntegrationProps = {
  chatClient: StreamChat | null;
  channel: any;
  webinar: WebinarWithPresenter;
  isConnected: boolean;
};

const AIAgentChatIntegration = ({ 
  chatClient, 
  channel, 
  webinar, 
  isConnected 
}: AIAgentChatIntegrationProps) => {
  const [aiMessages, setAiMessages] = useState<string[]>([]);

  // Send AI agent join message
  const sendAIJoinMessage = async () => {
    if (!channel || !webinar.aiAgentId) return;

    try {
      await channel.sendMessage({
        text: `🤖 AI Assistant has joined the webinar and is ready to help!`,
        user: {
          id: `ai-agent-${webinar.aiAgentId}`,
          name: "AI Assistant",
          image: "https://api.dicebear.com/7.x/bottts/svg?seed=AIAssistant",
        },
        custom_type: "ai_agent_message",
      });
    } catch (error) {
      console.error("Error sending AI join message:", error);
    }
  };

  // Send AI agent leave message
  const sendAILeaveMessage = async () => {
    if (!channel || !webinar.aiAgentId) return;

    try {
      await channel.sendMessage({
        text: `🤖 AI Assistant has left the webinar. Thanks for the great conversation!`,
        user: {
          id: `ai-agent-${webinar.aiAgentId}`,
          name: "AI Assistant",
          image: "https://api.dicebear.com/7.x/bottts/svg?seed=AIAssistant",
        },
        custom_type: "ai_agent_message",
      });
    } catch (error) {
      console.error("Error sending AI leave message:", error);
    }
  };

  // Send AI response to chat based on voice interaction
  const sendAIResponseToChat = async (message: string) => {
    if (!channel || !webinar.aiAgentId) return;

    try {
      await channel.sendMessage({
        text: `🎤 ${message}`,
        user: {
          id: `ai-agent-${webinar.aiAgentId}`,
          name: "AI Assistant",
          image: "https://api.dicebear.com/7.x/bottts/svg?seed=AIAssistant",
        },
        custom_type: "ai_agent_voice_message",
      });
    } catch (error) {
      console.error("Error sending AI response to chat:", error);
    }
  };

  // Handle AI agent speaking - send to chat
  useEffect(() => {
    const handleSpeechStart = () => {
      if (channel && isConnected) {
        // You could capture the AI speech and send it to chat
        // For now, we'll send a typing indicator
        channel.keystroke();
      }
    };

    const handleMessage = (message: string) => {
      // When AI speaks, also send to chat
      if (message && isConnected) {
        sendAIResponseToChat(message);
        setAiMessages(prev => [...prev, message]);
      }
    };

    // Listen for VAPI events
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("message", handleMessage);

    return () => {
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("message", handleMessage);
    };
  }, [channel, isConnected]);

  // Handle connection status changes
  useEffect(() => {
    if (isConnected) {
      sendAIJoinMessage();
    } else {
      sendAILeaveMessage();
    }
  }, [isConnected]);

  // Monitor chat messages to respond to AI mentions
  useEffect(() => {
    if (!channel || !isConnected) return;

    const handleNewMessage = (event: any) => {
      const message = event.message;
      
      // Check if message mentions AI or asks questions
      if (message?.text && !message.user?.id?.includes('ai-agent')) {
        const text = message.text.toLowerCase();
        
        // Trigger AI response for direct mentions or questions
        if (text.includes('@ai') || text.includes('ai assistant') || text.includes('?')) {
          // Could trigger VAPI to respond to the question
          console.log('AI should respond to:', message.text);
          
          // Send a quick acknowledgment
          setTimeout(() => {
            sendAIResponseToChat("I heard your question! Let me think about that...");
          }, 1000);
        }
      }
    };

    channel.on('message.new', handleNewMessage);

    return () => {
      channel.off('message.new', handleNewMessage);
    };
  }, [channel, isConnected]);

  return (
    <div className="hidden">
      {/* This component handles AI chat integration in the background */}
      {/* UI elements could be added here if needed */}
    </div>
  );
};

export default AIAgentChatIntegration; 