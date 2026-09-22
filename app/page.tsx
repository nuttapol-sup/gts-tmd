import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040e0c] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Banner Section */}
      <main className="flex-1 flex flex-col justify-center">
        <HeroSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
