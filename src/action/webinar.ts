"use server";

import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAndStartStream } from "./stremIo";
import { WebinarStatusEnum } from "@prisma/client";

export const createWebinar = async (
  formData: {
    basicInfo: {
      webinarName?: string;
      description?: string;
      // No date/time for instant sessions
    };
    cta: {
      ctaLabel?: string;
      tags?: string[];
      ctaType?: string;
      aiAgent?: string;
      // No priceId for non-sales focus
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
        message: "Unauthorized: Please sign in to create a session",
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
        message: "AI Agent selection is required for instant sessions",
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

    // Set start time to now for instant sessions
    const startTime = new Date();

    // Create the webinar/session with instant start
    const webinar = await prismaClient.webinar.create({
      data: {
        title: formData.basicInfo.webinarName || "AI Session",
        description: formData.basicInfo.description || "",
        startTime: startTime, // Start immediately
        tags: formData.cta.tags || [],
        ctaLabel: formData.cta.ctaLabel || "Start AI Session",
        ctaType: "BOOK_A_CALL", // Always AI interaction for instant sessions
        aiAgentId: formData.cta.aiAgent,
        priceId: null, // No pricing for instant AI sessions
        lockChat: formData.additionalInfo.lockChat || false,
        couponCode: formData.additionalInfo.couponEnabled
          ? formData.additionalInfo.couponCode
          : null,
        couponEnabled: formData.additionalInfo.couponEnabled || false,
        presenterId: presenterId,
        webinarStatus: "WAITING_ROOM", // Start in waiting room for immediate access
      },
    });

    // Auto-start the stream for instant sessions
    try {
      await createAndStartStream(webinar);
      
      // Update status to LIVE immediately
      await prismaClient.webinar.update({
        where: { id: webinar.id },
        data: { webinarStatus: "LIVE" },
      });
    } catch (streamError) {
      console.error("Error auto-starting stream:", streamError);
      // Don't fail the entire creation if stream fails - user can manually start
    }

    // Revalidate the webinars page to show the new session
    revalidatePath("/");

    return {
      status: 200,
      message: "AI Session created and started successfully!",
      webinarId: webinar.id,
      webinarLink: `/live-webinar/${webinar.id}`,
    };
  } catch (error) {
    console.error("Error creating AI session:", error);
    return {
      status: 500,
      message: "Failed to create AI session. Please try again.",
    };
  }
};

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

export const getWebinarByPresenterId = async (
  presenterId: string,
  webinarStatus?: string
) => {
  try {
   let statusFilter: WebinarStatusEnum | undefined;
   
   switch (webinarStatus) {
      case "upcoming":
        statusFilter = WebinarStatusEnum.SCHEDULED;
        break;
      case "ended":
        statusFilter = WebinarStatusEnum.ENDED;
        break;
      default:
        statusFilter = undefined;
    }


    const webinars = await prismaClient.webinar.findMany({
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

    return webinars;
  } catch (error) {
    console.error("Error fetching webinars:", error);
    throw new Error("Failed to fetch webinars");
  }
};

export const getWebinarById = async (webinarId: string) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
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

    return webinar;
  } catch (error) {
    console.error("Error fetching webinar:", error);
    throw new Error("Failed to fetch webinar");
  }
};

// change webinar status
export const changeWebinarStatus = async (
  webinarId: string,
  status: WebinarStatusEnum
) => {
  try {
    const webinar = await prismaClient.webinar.update({
      where: {
        id: webinarId,
      },
      data: {
        webinarStatus: status,
      },
    });

    return {
      status: 200,
      success: true,
      message: "Webinar status updated successfully",
      data: webinar,
    };
  } catch (error) {
    console.error("Error updating webinar status:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to update webinar status. Please try again.",
    };
  }
};
