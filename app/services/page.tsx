import { Suspense } from "react";
import Navbar from "@/components/navbar";
import DataHub from "@/components/data-hub";
import Footer from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ bulletinId?: string; bulletinHeader?: string; header?: string }>;
}) {
  const params = await searchParams;
  const isNewTab = Boolean(params?.bulletinId || params?.bulletinHeader || params?.header);

  return (
    <main className={`min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-[#040e0c] dark:via-[#071915] dark:to-[#040e0c] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 ${isNewTab ? "p-4 sm:p-8 justify-center items-center" : "pt-24 sm:pt-28 lg:pt-44"}`}>
      {/* Background Ambient Glowing Lights (Matching Main Page) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 dark:bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      {!isNewTab && <Navbar />}

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center text-slate-400">กำลังโหลด...</div>}>
          <DataHub />
        </Suspense>
      </div>

      {!isNewTab && <Footer />}
    </main>
  );
}
