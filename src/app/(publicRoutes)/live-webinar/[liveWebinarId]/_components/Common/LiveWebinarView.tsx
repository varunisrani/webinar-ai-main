/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Users, MessageSquare, Loader2 } from "lucide-react";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import {
  ParticipantView,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import { CtaTypeEnum } from "@prisma/client";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import CTADialogBox from "./CTADialogBox";
import type { WebinarWithPresenter } from "@/lib/type";
import { changeWebinarStatus } from "@/action/webinar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ObsDialogBox from "./ObsDialogBox";
import AIAgentHelper from "./AIAgentHelper";
import AIAgentParticipant from "./AIAgentParticipant";
import AIAgentChatIntegration from "./AIAgentChatIntegration";
import { StreamChatClientManager } from "@/lib/stream/streamChatClient";

type Props = {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  webinar: WebinarWithPresenter;
  isHost?: boolean;
  username: string;
  userId: string;
  call: Call;
  userToken: string;
};

const LiveWebinarView = ({
  showChat,
  setShowChat,
  webinar,
  isHost = false,
  username,
  userId,
  userToken,
  call,
}: Props) => {
  const { useParticipants, useParticipantCount } = useCallStateHooks();
  const participants = useParticipants();
  const hostParticipant = participants.length > 0 ? participants[0] : null;
  const viewerCount = useParticipantCount();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [obsDialogBox, setObsDialogOpen] = useState(false);
  const [isMultiTabMode, setIsMultiTabMode] = useState(false);
  const [aiAgentConnected, setAiAgentConnected] = useState(false);
  

  const handleEndStream = async () => {
    setLoading(true);
    try {
      // Stop the live stream
      await call.stopLive({
        continue_recording: false
      });
      
      // Update webinar status in database
      await changeWebinarStatus(webinar.id, "ENDED");
      
      toast.success("Webinar ended successfully");
      router.refresh();
    } catch (error) {
      console.error("Error ending webinar", error);
      toast.error("Failed to end webinar");
    } finally {
      setLoading(false);
    }
  };


  const handleCTAButtonClick = async () => {
    if (!channel) return;
    console.log("CTA button clicked", channel);
    await channel.sendEvent({
      type: "open_cta_dialog",
    });
  };

  // Initialize chat client with the new manager
  useEffect(() => {
    const init = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
        
        // Use the chat client manager to prevent consecutive connectUser warnings
        const client = await StreamChatClientManager.connectUser(
          apiKey,
          {
            id: userId,
            name: username,
            image: webinar.presenter.profileImage || undefined,
          },
          userToken
        );

        setChatClient(client);

        const channelInstance = client.channel("livestream", webinar.id, {
          name: webinar.title,
        });

        await channelInstance.watch();
        setChannel(channelInstance);

        // Listen for CTA events
        channelInstance.on((event: any) => {
          if (event.type === "open_cta_dialog") {
            setDialogOpen(true);
          }
          if (event.type === 'start_live') {
            window.location.reload();
          }
        });

        // Check for multi-tab mode
        const isSecondaryTab = sessionStorage.getItem(`webinar-${webinar.id}-secondary-tab`);
        setIsMultiTabMode(!!isSecondaryTab);

      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    init();

    // Cleanup function
    return () => {
      if (userId && process.env.NEXT_PUBLIC_STREAM_API_KEY) {
        StreamChatClientManager.disconnectUser(userId, process.env.NEXT_PUBLIC_STREAM_API_KEY);
      }
    };
  }, [userId, username, userToken, webinar]);

  if (!chatClient || !channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading webinar...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      {/* AI Agent Helper */}
      <AIAgentHelper 
        webinarId={webinar.id} 
        isHost={isHost} 
        currentComponent="LiveWebinarView"
      />

      {/* Main content area */}
      <div className={`${showChat ? "w-3/4" : "w-full"} flex flex-col transition-all duration-300`}>
        {/* Video area - now split between host and AI agent */}
        <div className="flex-1 relative rounded-lg overflow-hidden">
          {/* Host video (main area) */}
          <div className={`${webinar.aiAgentId && webinar.ctaType === "BOOK_A_CALL" ? "h-2/3" : "h-full"} bg-gray-900 relative`}>
            {hostParticipant ? (
              <ParticipantView
                participant={hostParticipant}
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{webinar.title}</h3>
                  <p className="text-gray-300">Waiting for the host to start...</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Agent video (bottom area) - only show for BOOK_A_CALL webinars */}
          {webinar.aiAgentId && webinar.ctaType === "BOOK_A_CALL" && (
            <div className="h-1/3 border-t border-border">
              <AIAgentParticipant
                webinar={webinar}
                userId={userId}
                isVisible={true}
                className="h-full rounded-none border-0"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-background border-t border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{viewerCount} viewers</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {showChat ? "Hide Chat" : "Show Chat"}
                </span>
              </Button>
            </div>
          </div>

          <div className="p-2 border-t border-border flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium capitalize">
                {webinar?.title}
              </div>
              {isMultiTabMode && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  Multi-Tab Mode
                </span>
              )}
            </div>

            {isHost && (
              <div className="flex items-center space-x-1">
                  <Button
                    onClick={async () => {
                      await channel.sendEvent({
                        type: 'start_live',
                      })
                    }}
                    variant="outline"
                    className="mr-2"
                  >
                    Go Live
                  </Button>
                
                <Button
                  onClick={() => setObsDialogOpen(true)}
                  variant="outline"
                  className="mr-2"
                >
                  Get OBS Creds
                </Button>
                <Button onClick={handleEndStream} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> Loading...
                    </>
                  ) : (
                    "End Stream"
                  )}
                </Button>
                <Button onClick={handleCTAButtonClick}>
                  {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
                    ? "Book a Call"
                    : "Buy Now"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Agent Chat Integration */}
      {webinar.aiAgentId && webinar.ctaType === "BOOK_A_CALL" && chatClient && channel && (
        <AIAgentChatIntegration
          chatClient={chatClient}
          channel={channel}
          webinar={webinar}
          isConnected={aiAgentConnected}
        />
      )}

      {/* Chat panel */}
      {showChat && (
        <div className="w-1/4 border-l border-border bg-background">
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium text-sm">Live Chat</h3>
                  <p className="text-xs text-muted-foreground">
                    {viewerCount} participants
                    {webinar.aiAgentId && webinar.ctaType === "BOOK_A_CALL" && (
                      <span className="ml-2 text-blue-500">+ AI Assistant</span>
                    )}
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageList />
                </div>
                {!webinar.lockChat && (
                  <div className="border-t border-border">
                    <MessageInput />
                  </div>
                )}
              </div>
            </Channel>
          </Chat>
        </div>
      )}

      {/* CTA Dialog */}
      <CTADialogBox
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        webinar={webinar}
        userId={userId}
      />

             {/* OBS Dialog */}
       <ObsDialogBox
         open={obsDialogBox}
         onOpenChange={setObsDialogOpen}
         rtmpURL={`rtmps://ingress.stream-io-video.com:443/${process.env.NEXT_PUBLIC_STREAM_API_KEY}.livestream.${webinar.id}`}
         streamKey={userToken}
       />
    </div>
  );
};

export default LiveWebinarView;
