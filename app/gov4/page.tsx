"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Zap } from "lucide-react";

export default function Gov4Page() {
  return (
    <ShowcaseViewer
      folder="06_การยกระดับสู่ราชการ 4.0"
      title="ศูนย์ข้อมูลการยกระดับสู่ระบบราชการ 4.0 (Gov 4.0)"
      badgeText="ระบบราชการ 4.0"
      description="ศูนย์รวมแผนงาน เอกสารพัฒนาองค์กร และผลการดำเนินงานการยกระดับสู่ระบบราชการ 4.0 ของกรมอุตุนิยมวิทยา"
      folderPathDisplay=""
      HeaderIcon={Zap}
    />
  );
}
