import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import VisitorStats from "@/components/visitor-stats";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Sidebar: Visitor Statistics Widget */}
          <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
            <VisitorStats />
          </div>

          {/* Right Main Hero Section */}
          <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
            <HeroSection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
