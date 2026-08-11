"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Plane } from "lucide-react";

export default function NocPage() {
  return (
    <ShowcaseViewer
      folder="01_Thailand NOC"
      title="ศูนย์ข้อมูล Thailand NOC"
      badgeText="Thailand NOC"
      description="ศูนย์รวมเอกสาร แผนผังโครงสร้าง อัตรากำลัง และสื่อประชาสัมพันธ์ Thailand NOC กรมอุตุนิยมวิทยา"
      folderPathDisplay=""
      HeaderIcon={Plane}
    />
  );
}
