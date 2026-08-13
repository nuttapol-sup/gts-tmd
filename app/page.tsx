import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
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
