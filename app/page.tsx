import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Banner Section */}
      <div className="flex-1 flex flex-col justify-center">
        <HeroSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
