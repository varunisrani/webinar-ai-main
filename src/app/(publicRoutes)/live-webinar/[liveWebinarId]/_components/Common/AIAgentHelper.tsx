"use client";

import { useState, useEffect } from "react";
import { Bot, MessageCircle, X, Code, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type CodeAnalysis = {
  component: string;
  description: string;
  usage: string;
  relatedFiles: string[];
};

type AIAgentHelperProps = {
  webinarId: string;
  isHost?: boolean;
  currentComponent?: string;
};

const AIAgentHelper = ({ webinarId, isHost = false, currentComponent }: AIAgentHelperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CodeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Code structure analysis data
  const codeStructureMap: Record<string, CodeAnalysis> = {
    "LiveWebinarView": {
      component: "LiveWebinarView",
      description: "Main live webinar viewing component that handles video streaming, chat, and CTA interactions",
      usage: "Renders the live stream player, chat interface, and action buttons for both hosts and participants",
      relatedFiles: [
        "CustomLiveStreamPlayer.tsx",
        "CTADialogBox.tsx", 
        "streamVideoClient.ts",
        "streamChatClient.ts"
      ]
    },
    "CTADialogBox": {
      component: "CTADialogBox", 
      description: "Enhanced dialog for multi-tab AI interactions with Book a Call and Join Group options",
      usage: "Provides two modes: Talk to AI Agent (opens new tab) and Join Group (current tab navigation)",
      relatedFiles: [
        "AutoConnectCall.tsx",
        "RenderWebinar.tsx",
        "streamVideoClient.ts"
      ]
    },
    "AutoConnectCall": {
      component: "AutoConnectCall",
      description: "AI-powered voice call component using VAPI for real-time conversation",
      usage: "Automatically connects users to AI agent for voice conversations with timer and controls",
      relatedFiles: [
        "vapiClient.ts",
        "CTADialogBox.tsx",
        "attendance.ts"
      ]
    },
    "RenderWebinar": {
      component: "RenderWebinar",
      description: "Smart router component that determines which webinar state to render based on status and user role",
      usage: "Conditionally renders LiveWebinarView, Participant view, or UpcomingWebinar state",
      relatedFiles: [
        "LiveWebinarView.tsx",
        "Participant.tsx", 
        "WebinarUpcomingState.tsx"
      ]
    }
  };

  const analyzeCurrentContext = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analysis = currentComponent ? 
        codeStructureMap[currentComponent] || null : 
        codeStructureMap["LiveWebinarView"];
      
      setCurrentAnalysis(analysis);
      setIsAnalyzing(false);
    }, 1000);
  };

  const getMultiTabInstructions = () => {
    return [
      {
        step: 1,
        title: "Start a Call/Webinar",
        description: "Click 'Talk to AI Agent' to open AI conversation in a new tab",
        icon: <Phone className="h-4 w-4" />
      },
      {
        step: 2, 
        title: "Open Second Tab",
        description: "Use 'Open Second Tab for Group View' to create a group discussion tab",
        icon: <Users className="h-4 w-4" />
      },
      {
        step: 3,
        title: "Join Group Discussion", 
        description: "In the second tab, click 'Join Group' to participate in group chat",
        icon: <MessageCircle className="h-4 w-4" />
      }
    ];
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "analyze_code":
        analyzeCurrentContext();
        break;
      case "multi_tab_guide":
        toast.success("Multi-tab guide explained! Check the instructions below.");
        break;
      case "open_ai_call":
        window.open(`/live-webinar/${webinarId}/call`, '_blank');
        break;
      case "troubleshoot":
        toast.info("Check console for any client connection warnings. Use the new StreamVideoClientManager to prevent multiple instances.");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Auto-analyze on component mount
    if (currentComponent) {
      analyzeCurrentContext();
    }
  }, [currentComponent]);

  return (
    <>
      {/* AI Helper Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* AI Helper Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-96 max-h-[600px] overflow-y-auto shadow-xl z-50 bg-background border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                AI Code Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction("analyze_code")}
                  className="text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  Analyze Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction("multi_tab_guide")}
                  className="text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Multi-Tab Guide
                </Button>
              </div>
            </div>

            {/* Code Analysis */}
            {currentAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Current Component Analysis</h4>
                  {isAnalyzing && (
                    <Badge variant="secondary" className="text-xs">Analyzing...</Badge>
                  )}
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">{currentAnalysis.component}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{currentAnalysis.description}</p>
                  <p className="text-xs"><strong>Usage:</strong> {currentAnalysis.usage}</p>
                  
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Related Files:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentAnalysis.relatedFiles.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{file}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Tab Instructions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Multi-Tab AI Flow</h4>
              <div className="space-y-2">
                {getMultiTabInstructions().map((instruction) => (
                  <div key={instruction.step} className="flex items-start gap-3 p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-xs font-medium">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {instruction.icon}
                        <span className="text-xs font-medium">{instruction.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{instruction.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Common Issues</h4>
              <div className="text-xs space-y-2 text-muted-foreground">
                <p>• <strong>Multiple client warnings:</strong> Using new StreamVideoClientManager</p>
                <p>• <strong>Consecutive connectUser:</strong> Using StreamChatClientManager</p>
                <p>• <strong>Missing descriptions:</strong> Added DialogDescription components</p>
              </div>
            </div>

            {isHost && (
              <div className="pt-2 border-t border-border">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleQuickAction("troubleshoot")}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIAgentHelper; 