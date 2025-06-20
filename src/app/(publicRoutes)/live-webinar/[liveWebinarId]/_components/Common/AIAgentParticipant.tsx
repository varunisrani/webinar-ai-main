"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi/vapiClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WebinarWithPresenter } from "@/lib/type";

type AIAgentParticipantProps = {
  webinar: WebinarWithPresenter;
  userId: string;
  isVisible?: boolean;
  className?: string;
};

const AIAgentParticipant = ({ 
  webinar, 
  userId, 
  isVisible = true,
  className = "" 
}: AIAgentParticipantProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const callTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // Start AI agent session
  const connectAIAgent = async () => {
    if (!webinar.aiAgentId) {
      toast.error("No AI agent configured for this webinar");
      return;
    }

    try {
      await vapi.start(webinar.aiAgentId);
      setIsConnected(true);
      toast.success("AI agent joined the webinar");
      
      // Start call duration timer
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Failed to connect AI agent:", error);
      toast.error("Failed to connect AI agent");
    }
  };

  // Disconnect AI agent
  const disconnectAIAgent = () => {
    try {
      vapi.stop();
      setIsConnected(false);
      setIsSpeaking(false);
      setCallDuration(0);
      
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
      
      toast.info("AI agent left the webinar");
    } catch (error) {
      console.error("Error disconnecting AI agent:", error);
    }
  };

  // Toggle AI agent mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: VAPI doesn't have direct mute, but we can visually indicate
    toast.info(isMuted ? "AI agent unmuted" : "AI agent muted");
  };

  // Toggle volume
  const toggleVolume = () => {
    setVolume(!volume);
    toast.info(volume ? "AI agent audio disabled" : "AI agent audio enabled");
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // VAPI event handlers
  useEffect(() => {
    const handleCallStart = () => {
      setIsConnected(true);
      setCallDuration(0);
    };

    const handleCallEnd = () => {
      setIsConnected(false);
      setIsSpeaking(false);
      setCallDuration(0);
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleError = (error: Error) => {
      console.error("VAPI error:", error);
      setIsConnected(false);
      setIsSpeaking(false);
      toast.error("AI agent connection error");
    };

    // Add VAPI event listeners
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("error", handleError);

    return () => {
      // Clean up event listeners
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("error", handleError);
      
      // Clean up timers
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);

  // Auto-connect when webinar is live and has AI agent
  useEffect(() => {
    if (webinar.webinarStatus === "LIVE" && webinar.aiAgentId && !isConnected) {
      // Auto-connect after a short delay
      reconnectTimer.current = setTimeout(() => {
        connectAIAgent();
      }, 2000);
    }

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [webinar.webinarStatus, webinar.aiAgentId, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectAIAgent();
      }
    };
  }, []);

  if (!isVisible || !webinar.aiAgentId) {
    return null;
  }

  return (
    <div className={cn(
      "relative bg-card rounded-xl overflow-hidden shadow-lg border border-border",
      className
    )}>
      {/* AI Agent Video Display */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 relative">
        {/* Status indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          <span>{isConnected ? "Connected" : "Offline"}</span>
        </div>

        {/* Call duration */}
        {isConnected && callDuration > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
            {formatDuration(callDuration)}
          </div>
        )}

        {/* AI Agent Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Speaking animation rings */}
            {isSpeaking && isConnected && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-30" style={{ margin: "-12px" }} />
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20" style={{ margin: "-24px", animationDelay: "0.3s" }} />
                <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-10" style={{ margin: "-36px", animationDelay: "0.6s" }} />
              </>
            )}

            {/* AI Avatar */}
            <div className={cn(
              "w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300",
              isSpeaking && isConnected 
                ? "border-blue-500 bg-blue-500/20" 
                : isConnected 
                  ? "border-blue-400 bg-blue-400/10" 
                  : "border-gray-400 bg-gray-400/10"
            )}>
              <Bot className={cn(
                "w-12 h-12 transition-colors duration-300",
                isSpeaking && isConnected 
                  ? "text-blue-600" 
                  : isConnected 
                    ? "text-blue-500" 
                    : "text-gray-500"
              )} />
            </div>

            {/* Speaking indicator */}
            {isSpeaking && isConnected && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full">
                <Mic className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* AI Agent Name */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          🤖 AI Assistant
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 bg-background border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <Button
                onClick={connectAIAgent}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Bot className="w-4 h-4 mr-1" />
                Connect AI
              </Button>
            ) : (
              <Button
                onClick={disconnectAIAgent}
                size="sm"
                variant="destructive"
              >
                <Bot className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              disabled={!isConnected}
              className="p-2"
            >
              {isMuted ? (
                <MicOff className="w-4 h-4 text-red-500" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVolume}
              disabled={!isConnected}
              className="p-2"
            >
              {volume ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Status message */}
        {isConnected && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {isSpeaking ? "AI is speaking..." : "AI is listening..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgentParticipant; 