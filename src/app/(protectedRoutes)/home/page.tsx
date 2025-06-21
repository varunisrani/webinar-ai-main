import React from "react";
import FeatureSectionLayout from "./_components/FeatureSectionLayout";
import FeatureCard from "./_components/FeatureCard";
import OnBoarding from "./_components/OnBoarding";
import { Upload, Webcam } from "lucide-react";
import Image from "next/image";


const page = () => {
  return (
    <div className="w-full mx-auto h-full">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-14">
        <div className="space-y-6">
          <h2 className="text-primary font-semibold text-4xl">
            Get maximum Conversion from your meetings
          </h2>
          <OnBoarding />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-content-center">
          <FeatureCard
            Icon={<Upload className="w-10 h-10" />}
            heading="Upload Pre-recorded Content"
            link="#"
          />
          <FeatureCard
            Icon={<Webcam className="w-10 h-10" />}
            heading="Create Live Meeting"
            link="/meetings"
          />
        </div>
      </div>
    </div>
  );
};

export default page;
