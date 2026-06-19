"use client";

import { useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TestimonialsMarquee from "./components/TestimonialsMarquee";
import TheShiftSection from "./components/TheShiftSection";
import ChallengeSection from "./components/ChallengeSection";
import LiveClassroomSection from "./components/LiveClassroomSection";
import IndiaStatsSection from "./components/IndiaStatsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import ReflectionSection from "./components/ReflectionSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

export default function Home() {
  useEffect(() => {
    // Global IntersectionObserver for .fade-up elements
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-background text-on-surface font-sans overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <TestimonialsMarquee />
      <TheShiftSection />
      <ChallengeSection />
      <LiveClassroomSection />
      <IndiaStatsSection />
      <HowItWorksSection />
      <ReflectionSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
