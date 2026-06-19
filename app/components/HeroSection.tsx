"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  useEffect(() => {
    // Fade-up on mount
    const el = document.getElementById("hero-content");
    if (el) setTimeout(() => el.classList.add("visible"), 100);
    const el2 = document.getElementById("hero-mockups");
    if (el2) setTimeout(() => el2.classList.add("visible"), 300);

    // Ambient glow follows mouse
    const handleMouseMove = (e: MouseEvent) => {
      const glows = document.querySelectorAll(".ambient-glow") as NodeListOf<HTMLElement>;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      glows.forEach((glow) => {
        glow.style.transform = `translate(${(x - 0.5) * 50}px, ${(y - 0.5) * 50}px) translateX(-50%)`;
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative pt-40 pb-32 px-6 overflow-hidden">
      {/* Ambient glow blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] ambient-glow pointer-events-none" />

      {/* Hero Text */}
      <div
        id="hero-content"
        className="max-w-4xl mx-auto text-center relative z-10 fade-up"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8">
          <span className="w-2 h-2 rounded-full bg-[#FE8495] animate-pulse" />
          <span className="text-xs tracking-widest uppercase">
            Now teaching across 24 Indian states
          </span>
        </div>

        <h1 className="font-semibold text-[40px] md:text-[72px] leading-[1.1] tracking-tighter mb-8">
          Transforming classrooms into <br />
          <span className="signature-gradient">engaging learning experiences.</span>
        </h1>

        <p className="text-on-surface-variant text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
          EduAgent handles the operational noise, so you can focus on the human
          connection. Empowering teachers to lead classrooms with confidence and heart.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-16">
          <input
            className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all text-on-surface"
            placeholder="Enter your school email"
            type="email"
          />
          <button className="w-full md:w-auto h-14 px-8 rounded-full gradient-button text-[#090A0F] font-semibold whitespace-nowrap hover:scale-105 transition-transform">
            Join the Movement
          </button>
        </div>
      </div>

      {/* Hero Mockups */}
      <div
        ref={heroRef}
        id="hero-mockups"
        className="max-w-[1300px] mx-auto mt-20 relative fade-up flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-32 xl:gap-40"
      >
        {/* Left: Dashboard Mockup */}
        <div className="flex-1 w-full max-w-4xl relative">
          <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="glass-card rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 p-5 relative z-10">
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Live · Class 8B
                </div>
                <h3 className="text-sm text-on-surface">Topic: Human Cell Anatomy</h3>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">
                  settings
                </span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">
                  more_vert
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Class Energy Widget */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col justify-between aspect-square">
                <span className="text-on-surface-variant text-xs uppercase tracking-widest">
                  Class energy
                </span>
                <div className="text-6xl font-semibold signature-gradient my-4">82%</div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
                  <div className="h-full gradient-button w-[82%]" />
                </div>
              </div>

              {/* Voice Widget */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center aspect-square gap-4">
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center animate-pulse-soft bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-3xl">mic</span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Voice assistant -{" "}
                  <span className="text-primary font-bold">Listening</span>
                </p>
                <button className="px-4 py-2 bg-primary/20 text-primary rounded-full text-xs tracking-widest uppercase border border-primary/20 hover:bg-primary/30 transition-colors">
                  Recover Attention
                </button>
              </div>

              {/* Analogy Widget */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-4 overflow-hidden aspect-[1.5/1] xl:aspect-square md:col-span-2 xl:col-span-1">
                <span className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
                  Active Analogy
                </span>
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-primary leading-relaxed italic">
                    &ldquo;Comparing Mitochondria to a city's main power plant...&rdquo;
                  </p>
                </div>
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mobile App UI */}
        <motion.div style={{ y: phoneY }} className="w-full max-w-[360px] shrink-0 relative mt-10 lg:mt-0">
          <div className="relative z-10 glass-card bg-[#090a0f]/95 rounded-[3rem] border-[8px] border-white/10 p-5 shadow-[0_0_80px_rgba(0,0,0,0.8)] h-[680px] flex flex-col overflow-hidden mx-auto">
            {/* Status Bar */}
            <div className="flex justify-between items-center text-white/50 text-[10px] mb-6 font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[14px]">cell_tower</span>
              <span>Live · Class 8B</span>
            </div>

            {/* Blue Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 to-teal-900/40 rounded-2xl p-5 mb-5 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-2xl rounded-full pointer-events-none" />
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1 relative z-10">TEACHING</div>
              <div className="text-[22px] font-bold text-white mb-4 leading-tight tracking-tight relative z-10">
                Human Cell Anatomy
              </div>
              <div className="flex gap-2 mb-2 relative z-10">
                <div className="h-1.5 bg-yellow-500 rounded-full w-1/3 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <div className="h-1.5 bg-white/20 rounded-full w-1/3" />
                <div className="h-1.5 bg-white/20 rounded-full w-1/3" />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase relative z-10">
                <span className="text-yellow-500">Hook</span>
                <span>Core Loop</span>
                <span>Anchor</span>
              </div>
            </div>

            {/* Pills */}
            <div className="space-y-3 mb-6 relative z-10">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 flex items-center gap-3 backdrop-blur-md">
                <div className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                  Hook
                </div>
                <div className="text-[13px] text-white/90 font-medium">
                  &ldquo;What&apos;s the power plant of your body?&rdquo;
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                <div className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
                  Loop
                </div>
                <div className="text-[13px] text-white/90">Tap to ask 3 students for guesses</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                <div className="px-2 py-1 rounded-md bg-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
                  Visual
                </div>
                <div className="text-[13px] text-white/90">Diagram ready · Send to board</div>
              </div>
            </div>

            {/* Class Energy Bar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-auto relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Class energy</span>
                <span className="text-teal-400 font-bold text-lg">82%</span>
              </div>
              <div className="flex items-end justify-between h-10 gap-1.5">
                {[40, 60, 80, 50, 70, 90, 80, 60, 70, 85, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-gradient-to-t from-[#A07CFE] to-[#4ADE80] rounded-full opacity-80 group-hover:opacity-100 transition-all duration-300"
                    style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Recover Attention */}
            <div className="mt-5 bg-[#022C22] border border-[#059669]/50 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-[15px] shadow-[0_0_20px_rgba(5,150,105,0.2)] cursor-pointer hover:bg-[#064E3B] transition-colors">
              <span className="material-symbols-outlined text-[#34D399] text-[20px]">pan_tool</span>
              Recover Attention
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute -left-20 top-16 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-slow hidden md:flex">
            <div className="text-yellow-500 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </div>
            <div>
              <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Students losing attention</div>
              <div className="text-white/50 text-[11px]">Suggest activity break?</div>
            </div>
          </div>

          <div className="absolute -right-28 top-48 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-medium hidden lg:flex">
            <div className="text-[#A07CFE] mt-0.5">
              <span className="material-symbols-outlined text-[18px]">translate</span>
            </div>
            <div>
              <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Switch to Hindi?</div>
              <div className="text-white/50 text-[11px]">3 students need it</div>
            </div>
          </div>

          <div className="absolute -left-28 bottom-40 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-fast hidden md:flex">
            <div className="text-[#4ADE80] mt-0.5">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <div>
              <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Local analogy ready</div>
              <div className="text-white/50 text-[11px]">&ldquo;Like a city power plant...&rdquo;</div>
            </div>
          </div>

          <div
            className="absolute -right-20 bottom-12 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-slow hidden sm:flex"
            style={{ animationDelay: "1s" }}
          >
            <div className="relative mt-0.5">
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,1)]" />
              <span className="material-symbols-outlined text-[#A07CFE] text-[18px]">mic</span>
            </div>
            <div>
              <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Voice assistant</div>
              <div className="text-white/50 text-[11px]">Listening · ready to help</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
