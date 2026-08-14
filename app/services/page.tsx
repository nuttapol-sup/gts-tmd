import { Suspense } from "react";
import Navbar from "@/components/navbar";
import DataHub from "@/components/data-hub";
import Footer from "@/components/footer";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col pt-24">
      <Navbar />

      <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center text-slate-400">กำลังโหลด...</div>}>
        <DataHub />
      </Suspense>

      <Footer />
    </main>
  );
}
