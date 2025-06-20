"use server";

import { prismaClient } from "@/lib/prismaClient";
import { getStreamClient } from "@/lib/stream/streamServerClient";
import { Attendee, Webinar } from "@prisma/client";
import { UserRequest } from "@stream-io/node-sdk";

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || "guest",
      role: "user",
      name: attendee?.name || "Guest",
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${attendee?.name || "Guest"}`,
    };
    await getStreamClient.upsertUsers([newUser]);
    // validity is optional (by default the token is valid for an hour)
    const validity = 60 * 60 * 60;
    const token = getStreamClient.generateUserToken({
      user_id: attendee?.id || "guest",
      validity_in_seconds: validity,
    });

    return token;
  } catch (error) {
    console.error("Error generating Stream Io token:", error);
    throw new Error("Failed to generate Stream Io token");
  }
};

export const createAndStartStream = async (webinar: Webinar) => {
  try {
    // Check if user already has a live webinar (excluding the current one)
    const activeWebinars = await prismaClient.webinar.findMany({
      where: {
        presenterId: webinar.presenterId,
        webinarStatus: "LIVE",
        NOT: {
          id: webinar.id // Exclude the current webinar from the check
        }
      }
    });

    if (activeWebinars.length > 0) {
      const activeWebinarTitles = activeWebinars.map(w => w.title).join(", ");
      throw new Error(`You already have ${activeWebinars.length} live stream(s) running: ${activeWebinarTitles}. Please end your current stream(s) before starting a new one.`);
    }

    // Check if this specific webinar is already in a LIVE state
    const currentWebinar = await prismaClient.webinar.findUnique({
      where: { id: webinar.id }
    });

    if (currentWebinar?.webinarStatus === "LIVE") {
      console.log("Webinar is already live, skipping stream creation");
      return;
    }

    try {
      const call = getStreamClient.video.call("livestream", webinar.id);
      
      // Check if call already exists and is live
      const callInfo = await call.get();
      if (callInfo.call.backstage === false) {
        console.log("Stream call already exists and is live");
        return;
      }
    } catch (callError) {
      // Call doesn't exist, which is fine - we'll create it
      console.log("Creating new stream call");
    }

    // Create or get the call
    const call = getStreamClient.video.call("livestream", webinar.id);
    await call.getOrCreate({
      data: {
        created_by_id: webinar.presenterId,
        members: [
          {
            user_id: webinar.presenterId,
            role: "host",
          },
        ],
      },
    });

    // Start the livestream
    await call.goLive({
      start_recording: true,
      recording_storage_name: "livestream",
    });

    console.log("Stream started successfully for webinar:", webinar.id);
  } catch (error) {
    console.error("Error creating and starting stream:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("already have a live stream")) {
        throw error; // Re-throw our custom error
      }
      if (error.message.includes("call is already live")) {
        console.log("Call is already live, continuing...");
        return; // Don't throw error if stream is already live
      }
    }
    
    throw new Error(error instanceof Error ? error.message : "Failed to create and start stream");
  }
};

export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string
) => {
  try {
    const newUser: UserRequest = {
      id: userId,
      role: "user",
      name: username || "Guest",
      image:
        profilePic ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    };
    await getStreamClient.upsertUsers([newUser]);

    const validity = 60 * 60 * 60;
    const token = getStreamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    });

    return token;
  } catch (error) {
    console.error("Error generating Stream Io token:", error);
    throw new Error("Failed to generate Stream Io token");
  }
};

// Helper function to check if a stream is active
export const checkStreamStatus = async (webinarId: string) => {
  try {
    const call = getStreamClient.video.call("livestream", webinarId);
    const callInfo = await call.get();
    
    return {
      exists: true,
      isLive: callInfo.call.backstage === false,
      callInfo: callInfo.call
    };
  } catch (error) {
    return {
      exists: false,
      isLive: false,
      callInfo: null
    };
  }
};

// Function to properly end a stream
export const endStream = async (webinarId: string) => {
  try {
    const call = getStreamClient.video.call("livestream", webinarId);
    
    // Stop the livestream
    await call.stopLive();
    
    console.log("Stream ended successfully for webinar:", webinarId);
    
    return {
      success: true,
      message: "Stream ended successfully"
    };
  } catch (error) {
    console.error("Error ending stream:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to end stream"
    };
  }
};

// Function to force end all active streams for a presenter
export const forceEndAllStreams = async (presenterId: string) => {
  try {
    // Get all active webinars for the presenter
    const activeWebinars = await prismaClient.webinar.findMany({
      where: {
        presenterId: presenterId,
        webinarStatus: "LIVE"
      }
    });

    const endResults = [];
    
    // End all active streams
    for (const webinar of activeWebinars) {
      try {
        const call = getStreamClient.video.call("livestream", webinar.id);
        await call.stopLive();
        
        // Update webinar status to ENDED
        await prismaClient.webinar.update({
          where: { id: webinar.id },
          data: { webinarStatus: "ENDED" }
        });
        
        endResults.push({
          webinarId: webinar.id,
          title: webinar.title,
          success: true
        });
        
        console.log("Force ended stream for webinar:", webinar.id);
      } catch (error) {
        console.error("Error force ending stream for webinar:", webinar.id, error);
        endResults.push({
          webinarId: webinar.id,
          title: webinar.title,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return {
      success: true,
      message: `Ended ${endResults.filter(r => r.success).length} active streams`,
      results: endResults
    };
  } catch (error) {
    console.error("Error force ending all streams:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to end active streams"
    };
  }
};

//get call recording
export const getStreamRecording = async(webinarId: string) => {
  try {
    const call = getStreamClient.video.call("livestream", webinarId);
    const calls = await call.listRecordings();

    return {
      success: true,
      status: 200,
      data: calls.recordings[calls.recordings.length - 1],
    };
  } catch (error) {
    console.error("Error getting stream recording:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to get stream recording",
    };
  }
};
