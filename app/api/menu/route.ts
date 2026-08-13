import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ABOUT_ROOT_DIR = process.env.ABOUT_DIR || path.join(process.cwd(), "About");
const CONFIG_PATH = path.join(process.cwd(), "config", "menu.json");

const ICON_PRESETS: Array<{ keyword: string; icon: string; color: string }> = [
  { keyword: "noc", icon: "Plane", color: "text-cyan-400" },
  { keyword: "smart", icon: "Award", color: "text-amber-400" },
  { keyword: "ค่านิยม", icon: "Award", color: "text-amber-400" },
  { keyword: "moral", icon: "ShieldCheck", color: "text-emerald-400" },
  { keyword: "คุณธรรม", icon: "ShieldCheck", color: "text-emerald-400" },
  { keyword: "ควบคุม", icon: "ShieldAlert", color: "text-rose-400" },
  { keyword: "km", icon: "BookOpen", color: "text-sky-400" },
  { keyword: "แลกเปลี่ยน", icon: "BookOpen", color: "text-sky-400" },
  { keyword: "gov4", icon: "Zap", color: "text-purple-400" },
  { keyword: "ราชการ 4.0", icon: "Zap", color: "text-purple-400" },
  { keyword: "4.0", icon: "Zap", color: "text-purple-400" },
  { keyword: "gibfc", icon: "MapPin", color: "text-teal-400" },
  { keyword: "แผนที่", icon: "MapPin", color: "text-teal-400" },
  { keyword: "swim", icon: "Globe", color: "text-blue-400" },
];

function getIconForFolder(folderName: string): { icon: string; iconColor: string } {
  const lower = folderName.toLowerCase();
  for (const preset of ICON_PRESETS) {
    if (lower.includes(preset.keyword)) {
      return { icon: preset.icon, iconColor: preset.color };
    }
  }
  return { icon: "Folder", iconColor: "text-cyan-400" };
}

export async function GET() {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ ABOUT_ROOT_DIR)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ ABOUT_ROOT_DIR, { recursive: true });
    }

    const entries = fs.readdirSync(/*turbopackIgnore: true*/ ABOUT_ROOT_DIR, { withFileTypes: true });
    const subfolders = entries.filter((e) => e.isDirectory());

    if (subfolders.length > 0) {
      const sortedSubfolders = subfolders.sort((a, b) => {
        const numA = a.name.match(/^(\d+)[\._\-\s]+/);
        const numB = b.name.match(/^(\d+)[\._\-\s]+/);
        if (numA && numB) {
          return parseInt(numA[1], 10) - parseInt(numB[1], 10);
        }
        if (numA) return -1;
        if (numB) return 1;
        return a.name.localeCompare(b.name, "th");
      });

      const dynamicSubmenu = sortedSubfolders.map((folder, idx) => {
        const cleanLabel = folder.name.replace(/^(\d+)[\._\-\s]+/, "");
        const { icon, iconColor } = getIconForFolder(folder.name);

        const lowerName = folder.name.toLowerCase();
        let href = `/about-folder?folder=${encodeURIComponent(folder.name)}`;
        if (lowerName.includes("noc")) href = "/noc";
        else if (lowerName.includes("smart") || lowerName.includes("ค่านิยม")) href = "/smart";
        else if (lowerName.includes("คุณธรรม") || lowerName.includes("moral")) href = "/moral";
        else if (lowerName.includes("ควบคุม")) href = "/control";
        else if (lowerName.includes("km") || lowerName.includes("แลกเปลี่ยน")) href = "/km";
        else if (lowerName.includes("4.0") || lowerName.includes("gov4") || lowerName.includes("ราชการ")) href = "/gov4";
        else if (lowerName.includes("gibfc") || lowerName.includes("แผนที่")) href = "/gibfc";
        else if (lowerName.includes("swim")) href = "/swim";

        return {
          id: `about-dir-${idx}`,
          label: cleanLabel,
          href,
          icon,
          iconColor,
          folderName: folder.name,
        };
      });

      return NextResponse.json({
        status: "success",
        menuSource: "dynamic-folder",
        aboutRootDir: ABOUT_ROOT_DIR,
        menu: {
          aboutSubmenu: dynamicSubmenu,
        },
      });
    }

    if (fs.existsSync(/*turbopackIgnore: true*/ CONFIG_PATH)) {
      const data = fs.readFileSync(/*turbopackIgnore: true*/ CONFIG_PATH, "utf-8");
      return NextResponse.json({ status: "success", menuSource: "config-file", menu: JSON.parse(data) });
    }
  } catch (e) {
    // fallback
  }

  return NextResponse.json({
    status: "success",
    menuSource: "default",
    menu: {
      aboutSubmenu: [],
    },
  });
}
