"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { ShieldAlert } from "lucide-react";

export default function ControlPage() {
  return (
    <ShowcaseViewer
      folder="04_ควบคุมภายใน"
      title="การควบคุมภายใน"
      badgeText="การควบคุมภายใน"
      description="ศูนย์รวมข้อมูล รายงาน และเอกสารการควบคุมภายใน กรมอุตุนิยมวิทยา"
      HeaderIcon={ShieldAlert}
    />
  );
}
