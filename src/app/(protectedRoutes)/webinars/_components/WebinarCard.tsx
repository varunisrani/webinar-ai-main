import { Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Webinar } from "@prisma/client";
import PipelineIcon from "@/icons/PipelineIcon";

type Props = {
  webinar: Webinar;
};

const WebinarCard = ({ webinar }: Props) => {
  return (
    <div className="flex gap-3 flex-col items-start w-full">
      <Link href={`/live-webinar/${webinar?.id}`} className="w-full max-w-[400px]">
        <Image
          src={"/darkthumbnail.png"}
          alt="webinar"
          width={400}
          height={100}
          className="rounded-md w-[400px]"
        />
      </Link>
      <div className="w-full flex justify-between gap-3 items-center">
        <Link
          href={`/live-webinar/${webinar?.id}`}
          className="flex flex-col gap-2 items-start"
        >
          <div>
            <p className="text-sm text-primary font-semibold">
              {webinar?.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {webinar?.description}
            </p>
          </div>

          <div className="flex gap-2 justify-start items-center">
            {/* {webinar?.startTime && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <Clock size={15} />
              <p>{format(new Date(webinar?.startTime), "dd/MM/yyyy")}</p>
            </div>
          )} */}
            {/* <div className="w-3 h-3 bg-muted rounded-full text-xs " /> */}
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <Calendar size={15} />
              <p>{format(new Date(webinar?.startTime), "dd/MM/yyyy")}</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/webinars/${webinar?.id}/pipeline`}
          className="flex px-4 py-2 rounded-md border-[0.5px] border-border bg-secondary"
        >
          <PipelineIcon className="w-4 h-4"/> 
        </Link>
      </div>
    </div>
  );
};

export default WebinarCard;
