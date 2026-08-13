"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { MapPin } from "lucide-react";

export default function GibfcPage() {
  return (
    <ShowcaseViewer
      folder="07_การจัดทำแผนที่และการใช้งาน GIBFC"
      title="การจัดทำแผนที่และการใช้งาน GIBFC"
      badgeText="การจัดทำแผนที่และการใช้งาน GIBFC"
      description="ศูนย์รวมข้อมูลการจัดทำแผนที่ สารสนเทศภูมิศาสตร์ และการใช้งาน GIBFC กรมอุตุนิยมวิทยา"
      HeaderIcon={MapPin}
    />
  );
}
