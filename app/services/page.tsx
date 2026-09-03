import { Suspense } from "react";
import Navbar from "@/components/navbar";
import DataHub from "@/components/data-hub";
import Footer from "@/components/footer";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ bulletinId?: string; bulletinHeader?: string }>;
}) {
  const params = await searchParams;
  const isNewTab = Boolean(params?.bulletinId || params?.bulletinHeader);

  return (
    <main className={`min-h-screen bg-[#0b132b] text-slate-100 flex flex-col ${isNewTab ? "p-4 sm:p-8 justify-center items-center" : "pt-24"}`}>
      {!isNewTab && <Navbar />}

      <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center text-slate-400">กำลังโหลด...</div>}>
        <DataHub />
      </Suspense>

      {!isNewTab && <Footer />}
    </main>
  );
}
