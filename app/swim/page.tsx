"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Globe } from "lucide-react";

export default function SwimPage() {
  return (
    <ShowcaseViewer
      folder="08_System Wide Information Management (SWIM)"
      title="ศูนย์ข้อมูล SWIM (System Wide Information Management)"
      badgeText="SWIM Showcase (D:\React\gts-tmd\About\08_System Wide Information Management (SWIM))"
      description="ศูนย์รวมข้อมูลมาตรฐานการแลกเปลี่ยนข้อมูลสารสนเทศการอุตุนิยมวิทยาการบินตามมาตรฐานองค์การการบินพลเรือนระหว่างประเทศ (ICAO)"
      folderPathDisplay="D:\React\gts-tmd\About\08_System Wide Information Management (SWIM)"
      HeaderIcon={Globe}
    />
  );
}
