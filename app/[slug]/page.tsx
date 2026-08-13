"use client";

import { use, useEffect, useState } from "react";
import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Folder } from "lucide-react";

interface DynamicFolderPageProps {
  params: Promise<{ slug: string }>;
}

export default function DynamicFolderPage({ params }: DynamicFolderPageProps) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug || "";

  const [cleanTitle, setCleanTitle] = useState("");
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!rawSlug) return;
    let decoded = rawSlug;
    try {
      decoded = decodeURIComponent(rawSlug);
    } catch (e) {
      // ignore
    }

    const clean = decoded.replace(/^(\d+)[\._\-\s]+/, "");
    setCleanTitle(clean);
    setFolderName(decoded);
    setIsLoading(false);
  }, [rawSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b132b] text-white flex items-center justify-center p-20 text-center">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <ShowcaseViewer
      folder={folderName}
      title={cleanTitle}
      badgeText={cleanTitle}
      description={`ศูนย์รวมข้อมูลและสื่อประชาสัมพันธ์ ${cleanTitle} กรมอุตุนิยมวิทยา`}
      HeaderIcon={Folder}
    />
  );
}
