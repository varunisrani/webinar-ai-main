import { useEffect, useState } from "react";
import {
  StreamVideo,
  User as StreamUser,
} from "@stream-io/video-react-sdk";
import { User } from "@prisma/client";
import { WebinarWithPresenter } from "@/lib/type";
import CustomLivestreamPlayer from "./CustomLiveStreamPlayer";
import { getTokenForHost } from "@/action/stremIo";
import { StreamVideoClientManager } from "@/lib/stream/streamVideoClient";

type Props = {
  apiKey: string;
  callId: string;
  webinar: WebinarWithPresenter;
  user: User;
};

const LiveStreamState = ({ apiKey, callId, webinar, user }: Props) => {
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get token for the host
        const token = await getTokenForHost(
          webinar.presenterId,
          webinar.presenter.name,
          webinar.presenter.profileImage
        );

        const hostUser: StreamUser = {
          id: webinar.presenterId,
          name: webinar.presenter.name,
          image: webinar.presenter.profileImage,
        };

        // Use the client manager to get or create a client instance
        const streamClient = StreamVideoClientManager.getOrCreateInstance(
          apiKey,
          hostUser,
          token
        );

        setHostToken(token);
        setClient(streamClient);
      } catch (error) {
        console.error("Error initializing stream client", error);
      }
    };

    init();

    // Cleanup function to disconnect client when component unmounts
    return () => {
      if (client && webinar.presenterId) {
        StreamVideoClientManager.disconnectClient(webinar.presenterId, apiKey);
      }
    };
  }, [apiKey, webinar]);

  if (!client || !hostToken) return null;

  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
        callId={callId}
        callType="livestream"
        webinar={webinar}
        username={user.name}
        token={hostToken}
      />
    </StreamVideo>
  );
};

export default LiveStreamState;
