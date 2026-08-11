"use client";

import { useSearchParams } from "next/navigation";
import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Folder } from "lucide-react";
import { Suspense } from "react";

function AboutFolderContent() {
  const searchParams = useSearchParams();
  const folderName = searchParams.get("folder") || "Thailand NOC";

  const cleanTitle = folderName.replace(/^(\d+)[\._\-\s]+/, "");

  return (
    <ShowcaseViewer
      folder={folderName}
      title={cleanTitle}
      badgeText={`D:\\React\\gts-tmd\\About\\${folderName}`}
      description={`ศูนย์รวมข้อมูลและสื่อประชาสัมพันธ์ ${cleanTitle} กรมอุตุนิยมวิทยา`}
      folderPathDisplay={`D:\\React\\gts-tmd\\About\\${folderName}`}
      HeaderIcon={Folder}
    />
  );
}

export default function AboutFolderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b132b] text-white p-20 text-center">กำลังโหลด...</div>}>
      <AboutFolderContent />
    </Suspense>
  );
}
