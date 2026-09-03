import type { Metadata } from "next";
import { Prompt, Kanit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
  adjustFontFallback: false,
});

const kanit = Kanit({
  weight: ["400", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
  display: "swap",
  adjustFontFallback: false,
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "RTH Bangkok | ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้ (GTS TMD)",
  description: "ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้ (สื่อสารระหว่างประเทศ) RTH Bangkok / GTS Thailand / ข้อมูลสภาพอากาศและข่าวสารอุตุนิยมวิทยา กรมอุตุนิยมวิทยา",
  keywords: ["RTH Bangkok", "GTS TMD", "กรมอุตุนิยมวิทยา", "Synoptic", "UpperAir", "METAR", "เตือนภัย", "พยากรณ์อากาศ"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${kanit.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0b132b] text-slate-100 selection:bg-cyan-500 selection:text-white">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
