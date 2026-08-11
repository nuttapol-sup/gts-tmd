"use client";

import ShowcaseViewer from "@/components/ShowcaseViewer";
import { ShieldCheck } from "lucide-react";

export default function MoralPage() {
  return (
    <ShowcaseViewer
      folder="03_องค์กรคุณธรรม"
      title="ศูนย์ข้อมูลองค์กรคุณธรรม (Moral Organization)"
      badgeText="องค์กรคุณธรรม"
      description="ศูนย์รวมเอกสาร แผนงาน และกิจกรรมส่งเสริมองค์กรคุณธรรม โปร่งใส สุจริต และมีธรรมาภิบาล กรมอุตุนิยมวิทยา"
      folderPathDisplay=""
      HeaderIcon={ShieldCheck}
    />
  );
}
