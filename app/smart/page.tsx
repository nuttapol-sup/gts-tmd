"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Award } from "lucide-react";

export default function SmartPage() {
  return (
    <ShowcaseViewer
      folder="02_So Smart"
      title="ศูนย์ข้อมูลค่านิยมองค์กร (SO-SMART)"
      badgeText="ค่านิยมองค์กร SO-SMART"
      description="ศูนย์รวมข้อมูลและสื่อประชาสัมพันธ์ค่านิยมองค์กร SO-SMART ของกรมอุตุนิยมวิทยา"
      folderPathDisplay=""
      HeaderIcon={Award}
    />
  );
}
