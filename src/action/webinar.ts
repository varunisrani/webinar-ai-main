"use server";

import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAndStartStream } from "./stremIo";
import { WebinarStatusEnum } from "@prisma/client";

export const createCampaign = async (
  formData: {
    basicInfo: {
      meetingName?: string;
      description?: string;
      // No date/time for instant campaigns
    };
    cta: {
      ctaLabel?: string;
      tags?: string[];
      ctaType?: string;
      aiAgent?: string;
      // No priceId for negotiation focus
    };
    additionalInfo: {
      lockChat?: boolean;
      couponCode?: string;
      couponEnabled?: boolean;
    };
  }
) => {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user?.id) {
      return {
        status: 401,
        message: "Unauthorized: Please sign in to create a campaign",
      };
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userRecord) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    const presenterId = userRecord.id;

    // Validate AI Agent is provided and belongs to user
    if (!formData.cta.aiAgent) {
      return {
        status: 400,
        message: "AI Agent selection is required for negotiation campaigns",
      };
    }

    const aiAgent = await prismaClient.aiAgents.findFirst({
      where: {
        id: formData.cta.aiAgent,
        userId: presenterId,
      },
    });

    if (!aiAgent) {
      return {
        status: 400,
        message: "Selected AI Agent not found or doesn't belong to you",
      };
    }

    // Set start time to now for instant campaigns
    const startTime = new Date();

    // Create the campaign with instant start
    const campaign = await prismaClient.webinar.create({
      data: {
        title: formData.basicInfo.meetingName || "Brand Partnership Campaign",
        description: formData.basicInfo.description || "",
        startTime: startTime, // Start immediately
        tags: formData.cta.tags || [],
        ctaLabel: formData.cta.ctaLabel || "Start Partnership Discussion",
        ctaType: "BOOK_A_CALL", // Always AI negotiation for campaigns
        aiAgentId: formData.cta.aiAgent,
        priceId: null, // No pricing for negotiation campaigns
        lockChat: formData.additionalInfo.lockChat || false,
        couponCode: formData.additionalInfo.couponEnabled
          ? formData.additionalInfo.couponCode
          : null,
        couponEnabled: formData.additionalInfo.couponEnabled || false,
        presenterId: presenterId,
        webinarStatus: "WAITING_ROOM", // Start in waiting room for immediate access
      },
    });

    // Auto-start the stream for instant campaigns
    try {
      await createAndStartStream(campaign);
      
      // Update status to LIVE immediately
      await prismaClient.webinar.update({
        where: { id: campaign.id },
        data: { webinarStatus: "LIVE" },
      });
    } catch (streamError) {
      console.error("Error auto-starting stream:", streamError);
      // Don't fail the entire creation if stream fails - user can manually start
    }

    // Revalidate the campaigns page to show the new campaign
    revalidatePath("/");

    return {
      status: 200,
      message: "Campaign created and started successfully!",
      meetingId: campaign.id,
      meetingLink: `/live-meeting/${campaign.id}`,
    };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return {
      status: 500,
      message: "Failed to create campaign. Please try again.",
    };
  }
};

// Export alias for backward compatibility
export const createMeeting = createCampaign;

// Helper function to combine date and time
function combineDateTime(
  date: Date,
  timeStr: string,
  timeFormat: "AM" | "PM"
): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr || "0", 10);

  // Convert to 24-hour format
  if (timeFormat === "PM" && hours < 12) {
    hours += 12;
  } else if (timeFormat === "AM" && hours === 12) {
    hours = 0;
  }

  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export const getMeetingByPresenterId = async (
  presenterId: string,
  meetingStatus?: string
) => {
  try {
   let statusFilter: WebinarStatusEnum | undefined;
   
   switch (meetingStatus) {
      case "upcoming":
        statusFilter = WebinarStatusEnum.SCHEDULED;
        break;
      case "ended":
        statusFilter = WebinarStatusEnum.ENDED;
        break;
      default:
        statusFilter = undefined;
    }


    const meetings = await prismaClient.webinar.findMany({
      where: {
        presenterId,
        webinarStatus: statusFilter
      },
      include: {
        presenter: {
          select: {
            id: true,
            name: true,
            stripeConnectId: true,
          },
        },
      },
    });

    return meetings;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw new Error("Failed to fetch meetings");
  }
};

export const getMeetingById = async (meetingId: string) => {
  try {
    const meeting = await prismaClient.webinar.findUnique({
      where: { id: meetingId },
      include: {
        presenter: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            stripeConnectId: true,
          },
        },
      },
    });

    return meeting;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    throw new Error("Failed to fetch meeting");
  }
};

// change meeting status
export const changeMeetingStatus = async (
  meetingId: string,
  status: WebinarStatusEnum
) => {
  try {
    const meeting = await prismaClient.webinar.update({
      where: {
        id: meetingId,
      },
      data: {
        webinarStatus: status,
      },
    });

    return {
      status: 200,
      success: true,
      message: "Meeting status updated successfully",
      data: meeting,
    };
  } catch (error) {
    console.error("Error updating meeting status:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to update meeting status. Please try again.",
    };
  }
};
