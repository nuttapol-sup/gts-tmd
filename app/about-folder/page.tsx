"use client";

import { useSearchParams, useRouter } from "next/navigation";
import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Folder } from "lucide-react";
import { Suspense, useEffect } from "react";

function AboutFolderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderName = searchParams.get("folder") || "Thailand NOC";

  useEffect(() => {
    if (!folderName) return;
    const lower = folderName.trim().toLowerCase();
    if (lower.includes("noc")) router.replace("/noc");
    else if (lower.includes("smart") || lower.includes("ค่านิยม")) router.replace("/smart");
    else if (lower.includes("คุณธรรม") || lower.includes("moral")) router.replace("/moral");
    else if (lower.includes("ควบคุม")) router.replace("/control");
    else if (lower.includes("km") || lower.includes("แลกเปลี่ยน")) router.replace("/km");
    else if (lower.includes("4.0") || lower.includes("gov4") || lower.includes("ราชการ")) router.replace("/gov4");
    else if (lower.includes("gibfc") || lower.includes("แผนที่")) router.replace("/gibfc");
    else if (lower.includes("swim")) router.replace("/swim");
  }, [folderName, router]);

  const cleanTitle = folderName.replace(/^(\d+)[\._\-\s]+/, "");

  return (
    <ShowcaseViewer
      folder={folderName}
      title={cleanTitle}
      badgeText={cleanTitle}
      description={`ศูนย์รวมข้อมูลและสื่อประชาสัมพันธ์ ${cleanTitle} กรมอุตุนิยมวิทยา`}
      folderPathDisplay=""
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
