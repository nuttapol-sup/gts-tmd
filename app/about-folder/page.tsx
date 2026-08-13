"use client";

import { useSearchParams, useRouter } from "next/navigation";
import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Folder } from "lucide-react";
import { Suspense, useEffect } from "react";

function AboutFolderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderName = searchParams.get("folder") || searchParams.get("title") || "Thailand NOC";

  useEffect(() => {
    if (!folderName) return;
    const lower = folderName.trim().toLowerCase();
    
    // Redirect existing preset routes
    if (lower.includes("noc")) { router.replace("/noc"); return; }
    if (lower.includes("smart") || lower.includes("ค่านิยม")) { router.replace("/smart"); return; }
    if (lower.includes("คุณธรรม") || lower.includes("moral")) { router.replace("/moral"); return; }
    if (lower.includes("ควบคุม")) { router.replace("/control"); return; }
    if (lower.includes("km") || lower.includes("แลกเปลี่ยน")) { router.replace("/km"); return; }
    if (lower.includes("4.0") || lower.includes("gov4") || lower.includes("ราชการ")) { router.replace("/gov4"); return; }
    if (lower.includes("gibfc") || lower.includes("แผนที่")) { router.replace("/gibfc"); return; }
    if (lower.includes("swim")) { router.replace("/swim"); return; }

    // Automatic URL cleaning for ANY future new folder!
    const cleanTitle = folderName.replace(/^(\d+)[\._\-\s]+/, "");
    if (typeof window !== "undefined" && window.location.search.includes("folder=")) {
      const cleanUrl = `${window.location.pathname}?title=${encodeURIComponent(cleanTitle)}`;
      window.history.replaceState(null, "", cleanUrl);
    }
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
