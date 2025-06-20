import { Button } from "@/components/ui/button";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import { format } from "date-fns";
import { Calendar, Clock, Loader2 } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import WaitListComponent from "./WaitListComponent";
import CountdownTimer from "./CountdownTimer";
import { toast } from "sonner";
import { changeWebinarStatus } from "@/action/webinar";
import { useRouter } from "next/navigation";
import { sendBulkEmail } from "@/action/resend";
import { createAndStartStream } from "@/action/stremIo";


type Props = {
  webinar: Webinar;
  currentUser: User | null;
};

const WebinarUpcomingState = ({ webinar, currentUser }: Props) => {

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleStartWebinar = async () => {
    setLoading(true);
    try {
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
      // Create and start the stream
      await createAndStartStream(webinar);
      
      // Update webinar status to LIVE
      const res = await changeWebinarStatus(webinar.id, "LIVE");
      if (!res.success) {
        throw new Error(res.message);
      }
      
      // Send email notifications to attendees
      await sendBulkEmail(webinar.id);
      
      // Refresh the page to show the live state
      router.refresh();
      toast.success("Webinar started successfully");
      
    } catch (error) {
      console.log("Error starting webinar:", error);
      
      // Provide specific error messages for better UX
      let errorMessage = "Something went wrong";
      
      if (error instanceof Error) {
        if (error.message.includes("already have a live stream")) {
          errorMessage = "You already have a live webinar running. Please end your current webinar before starting a new one.";
        } else if (error.message.includes("not authenticated")) {
          errorMessage = "Please log in to start the webinar.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen mx-auto max-w-[400px] flex flex-col justify-center items-center gap-8 py-20">
      {/* timer container */}
      <div className="space-y-6">
        <p className="text-3xl font-semibold text-primary text-center">
          Seems Like you are a little early
        </p>

        <CountdownTimer
          targetDate={new Date(webinar.startTime)}
          className="text-center"
          webinarId={webinar.id}
          webinarStatus={webinar.webinarStatus}
        />
      </div>

      {/* Reminder component */}
      <div className="space-y-6 w-full h-full flex justify-center items-center flex-col">
        <div className="w-full max-w-md aspect-video relative rounded-4xl overflow-hidden mb-6">
          <Image
            src={"/ilfthumbnail.png"}
            alt={webinar.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {webinar?.webinarStatus === WebinarStatusEnum.LIVE ? (
          <WaitListComponent webinarId={webinar.id} webinarStatus="LIVE" />
        ) : webinar?.webinarStatus === WebinarStatusEnum.CANCELLED ? (
          <p className="text-xl text-foreground text-center font-semibold">
            Webinar is cancelled
          </p>
        ) : webinar?.webinarStatus === WebinarStatusEnum.ENDED ? (
          <Button disabled={true}>Ended</Button>
        ) : webinar?.webinarStatus === WebinarStatusEnum.SCHEDULED &&
          new Date(webinar.startTime).getTime() > Date.now() ? (
          <WaitListComponent webinarId={webinar.id} webinarStatus="SCHEDULED" />
        ) : webinar?.webinarStatus === WebinarStatusEnum.WAITING_ROOM ||
          new Date(webinar.startTime).getTime() < Date.now() ? (
          currentUser?.id === webinar?.presenterId ? (
            <Button
              className="w-full max-w-[300px] font-semibold"
              onClick={handleStartWebinar}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                "Start Webinar"
              )}
            </Button>
          ) : (
            <WaitListComponent
              webinarId={webinar.id}
              webinarStatus="WAITING_ROOM"
            />
          )
        ) : null}
      </div>

      {/* description component */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-primary">
          {webinar?.title}
        </h3>
        <p className="text-muted-foreground text-xs">{webinar.description}</p>
        <div className="w-full justify-center flex gap-2 flex-wrap items-center">
          <Button
            variant={"outline"}
            className="rounded-md bg-secondary backdrop-blur-2xl"
          >
            <Calendar className="mr-2" />
            {format(new Date(webinar.startTime), "dd MMMM yyyy")}
          </Button>

          <Button variant={"outline"}>
            <Clock className="mr-2" />
            {format(new Date(webinar.startTime), "hh:mm a")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebinarUpcomingState;
