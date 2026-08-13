import { notFound } from "next/navigation";
import ShowcaseViewer from "@/components/ShowcaseViewer";
import { Folder } from "lucide-react";
import fs from "fs";
import path from "path";

const ABOUT_ROOT_DIR = process.env.ABOUT_DIR || path.join(process.cwd(), "About");

interface DynamicFolderPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicFolderPage({ params }: DynamicFolderPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();

  if (!fs.existsSync(/*turbopackIgnore: true*/ ABOUT_ROOT_DIR)) {
    notFound();
  }

  const entries = fs.readdirSync(/*turbopackIgnore: true*/ ABOUT_ROOT_DIR, { withFileTypes: true });
  const subfolders = entries.filter((e) => e.isDirectory());

  // Find matching subfolder in About/ by clean title or raw folder name
  const matchedFolder = subfolders.find((f) => {
    const rawName = f.name.toLowerCase();
    const cleanName = f.name.replace(/^(\d+)[\._\-\s]+/, "").toLowerCase();
    return cleanName === decodedSlug || rawName === decodedSlug;
  });

  if (!matchedFolder) {
    notFound();
  }

  const actualFolderName = matchedFolder.name;
  const cleanTitle = actualFolderName.replace(/^(\d+)[\._\-\s]+/, "");

  return (
    <ShowcaseViewer
      folder={actualFolderName}
      title={cleanTitle}
      badgeText={cleanTitle}
      description={`ศูนย์รวมข้อมูลและสื่อประชาสัมพันธ์ ${cleanTitle} กรมอุตุนิยมวิทยา`}
      HeaderIcon={Folder}
    />
  );
}
