"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { BookOpen } from "lucide-react";

export default function KmPage() {
  return (
    <ShowcaseViewer
      folder="05_กิจกรรมแลกเปลี่ยนความรู้ KM"
      title="กิจกรรมแลกเปลี่ยนความรู้ KM"
      badgeText="กิจกรรมแลกเปลี่ยนความรู้ KM"
      description="ศูนย์รวมข้อมูล และสื่อประชาสัมพันธ์ กิจกรรมแลกเปลี่ยนความรู้ KM กรมอุตุนิยมวิทยา"
      HeaderIcon={BookOpen}
    />
  );
}
