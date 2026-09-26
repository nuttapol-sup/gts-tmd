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
    <main className={`min-h-screen bg-white dark:bg-[#040e0c] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 ${isNewTab ? "p-4 sm:p-8 justify-center items-center" : "pt-24 sm:pt-28 lg:pt-44"}`}>
      {!isNewTab && <Navbar />}

      <div className="w-full max-w-7xl mx-auto">
        <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center text-slate-400">กำลังโหลด...</div>}>
          <DataHub />
        </Suspense>
      </div>

      {!isNewTab && <Footer />}
    </main>
  );
}
