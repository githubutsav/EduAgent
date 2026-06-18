import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TrustSection from "./components/TrustSection";
import FeaturesGrid from "./components/FeaturesGrid";
import ProductShowcase from "./components/ProductShowcase";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <TrustSection />
        <FeaturesGrid />
        <ProductShowcase />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
