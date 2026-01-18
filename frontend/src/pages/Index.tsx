import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { VirtualCards } from "@/components/VirtualCards";
import { Dashboard } from "@/components/Dashboard";
import { AISupport } from "@/components/AISupport";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <VirtualCards />
      <Dashboard />
      <AISupport />
      <Footer />
    </div>
  );
};

export default Index;
