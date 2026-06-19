"use client";

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DisplayCards from "@/components/ui/display-cards";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"]
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  useEffect(() => {
    // Intersection Observer for Fade Up Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Background breathing effect script
    const handleMouseMove = (e: MouseEvent) => {
        const glows = document.querySelectorAll('.ambient-glow') as NodeListOf<HTMLElement>;
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        glows.forEach(glow => {
            glow.style.transform = `translate(${(x - 0.5) * 50}px, ${(y - 0.5) * 50}px) translateX(-50%)`;
        });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      observer.disconnect();
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <main className="bg-background-deep text-on-surface font-sans overflow-x-hidden">
      {/* TopNavBar */}
      <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4 pointer-events-none">
        <nav className="w-full max-w-[1280px] backdrop-blur-xl border border-white/10 bg-[#121318]/80 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-300">
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">EduAgent</span>
            </div>
            <div className="hidden md:flex items-center gap-8 pt-1">
              <a className="relative text-on-surface-variant hover:text-primary transition-colors text-sm font-geist uppercase tracking-widest group/link pb-2" href="#">
                Vision
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
              </a>
              <a className="relative text-on-surface-variant hover:text-primary transition-colors text-sm font-geist uppercase tracking-widest group/link pb-2" href="#features">
                Features
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
              </a>
              <a className="relative text-on-surface-variant hover:text-primary transition-colors text-sm font-geist uppercase tracking-widest group/link pb-2" href="#">
                For India
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
              </a>
              <a className="relative text-on-surface-variant hover:text-primary transition-colors text-sm font-geist uppercase tracking-widest group/link pb-2" href="#experience">
                Experience
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
              </a>
            </div>
            <button className="px-6 py-2 rounded-full gradient-button text-white font-bold text-sm font-geist uppercase tracking-widest hover:scale-105 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(160,124,254,0.4)]">
              Get Started
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] ambient-glow pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 fade-up" id="hero-content">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FE8495] animate-pulse"></span>
            <span className="text-xs font-geist tracking-widest uppercase">Now teaching across 24 Indian states</span>
          </div>
          <h1 className="font-geist font-semibold text-[40px] md:text-[72px] leading-[1.1] tracking-tighter mb-8">
            Transforming classrooms into <br />
            <span className="signature-gradient">engaging learning experiences.</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            EduAgent handles the operational noise, so you can focus on the human connection. Empowering teachers to lead classrooms with confidence and heart.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-16">
            <input className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all text-on-surface" placeholder="Enter your school email" type="email" />
            <button className="w-full md:w-auto h-14 px-8 rounded-full gradient-button text-background-deep font-semibold whitespace-nowrap hover:scale-105 transition-transform">
              Join the Movement
            </button>
          </div>
        </div>

        {/* Hero Mockups Container */}
        <div ref={heroRef} className="max-w-[1300px] mx-auto mt-20 relative fade-up flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-32 xl:gap-40" style={{ transitionDelay: "200ms" }}>
          
          {/* Left: Dashboard Mockup */}
          <div className="flex-1 w-full max-w-4xl relative">
            <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="glass-card rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 p-5 relative z-10">
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Live · Class 8B
                  </div>
                  <h3 className="font-geist text-sm text-on-surface">Topic: Human Cell Anatomy</h3>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">settings</span>
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">more_vert</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Left Widget */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col justify-between aspect-square">
                  <span className="text-on-surface-variant text-xs font-geist uppercase tracking-widest">Class energy</span>
                  <div className="text-6xl font-semibold font-geist signature-gradient my-4">82%</div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
                    <div className="h-full gradient-button w-[82%]"></div>
                  </div>
                </div>

                {/* Center Widget */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center aspect-square gap-4">
                  <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center animate-pulse-soft bg-primary/10">
                    <span className="material-symbols-outlined text-primary text-3xl">mic</span>
                  </div>
                  <p className="text-sm font-geist text-on-surface-variant">Voice assistant - <span className="text-primary font-bold">Listening</span></p>
                  <button className="mt-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-xs font-geist tracking-widest uppercase border border-primary/20 hover:bg-primary/30 transition-colors">
                    Recover Attention
                  </button>
                </div>

                {/* Right Widget */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-4 overflow-hidden aspect-[1.5/1] xl:aspect-square md:col-span-2 xl:col-span-1">
                  <span className="text-on-surface-variant text-xs font-geist uppercase tracking-widest mb-2">Active Analogy</span>
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-sm text-primary leading-relaxed italic">"Comparing Mitochondria to a city's main power plant..."</p>
                  </div>
                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="h-2 w-full bg-white/10 rounded-full"></div>
                    <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Mobile App UI Module */}
          <motion.div style={{ y: phoneY }} className="w-full max-w-[360px] shrink-0 relative mt-10 lg:mt-0">
            {/* The Phone Container */}
            <div className="relative z-10 glass-card bg-[#090a0f]/95 rounded-[3rem] border-[8px] border-white/10 p-5 shadow-[0_0_80px_rgba(0,0,0,0.8)] h-[680px] flex flex-col overflow-hidden mx-auto">
              {/* Phone Status Bar */}
              <div className="flex justify-between items-center text-white/50 text-[10px] mb-6 font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">cell_tower</span>
                <span>Live · Class 8B</span>
              </div>
              
              {/* Blue Banner */}
              <div className="bg-gradient-to-r from-blue-900/40 to-teal-900/40 rounded-2xl p-5 mb-5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-2xl rounded-full pointer-events-none"></div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1 relative z-10">TEACHING</div>
                <div className="text-[22px] font-bold text-white mb-4 leading-tight tracking-tight relative z-10">Human Cell Anatomy</div>
                {/* Timeline Progress */}
                <div className="flex gap-2 mb-2 relative z-10">
                  <div className="h-1.5 bg-yellow-500 rounded-full w-1/3 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                  <div className="h-1.5 bg-white/20 rounded-full w-1/3"></div>
                  <div className="h-1.5 bg-white/20 rounded-full w-1/3"></div>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase relative z-10">
                  <span className="text-yellow-500">Hook</span>
                  <span>Core Loop</span>
                  <span>Anchor</span>
                </div>
              </div>

              {/* Pills / Suggestions */}
              <div className="space-y-3 mb-6 relative z-10">
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 flex items-center gap-3 backdrop-blur-md">
                  <div className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">Hook</div>
                  <div className="text-[13px] text-white/90 font-medium">"What's the power plant of your body?"</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                  <div className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">Loop</div>
                  <div className="text-[13px] text-white/90">Tap to ask 3 students for guesses</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                  <div className="px-2 py-1 rounded-md bg-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">Visual</div>
                  <div className="text-[13px] text-white/90">Diagram ready · Send to board</div>
                </div>
              </div>

              {/* Class Energy */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-auto relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-white/50 font-geist uppercase tracking-widest font-bold">Class energy</span>
                  <span className="text-teal-400 font-bold text-lg">82%</span>
                </div>
                {/* Bar chart visualizer */}
                <div className="flex items-end justify-between h-10 gap-1.5">
                  {[40, 60, 80, 50, 70, 90, 80, 60, 70, 85, 95].map((h, i) => (
                    <div key={i} className="w-full bg-gradient-to-t from-[#A07CFE] to-[#4ADE80] rounded-full opacity-80 group-hover:opacity-100 transition-all duration-300" style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}></div>
                  ))}
                </div>
              </div>

              {/* Recover Attention Button */}
              <div className="mt-5 bg-[#022C22] border border-[#059669]/50 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-[15px] shadow-[0_0_20px_rgba(5,150,105,0.2)] cursor-pointer hover:bg-[#064E3B] transition-colors">
                <span className="material-symbols-outlined text-[#34D399] text-[20px]">pan_tool</span>
                Recover Attention
              </div>
            </div>

            {/* Floating Cards (Animated) */}
            {/* Top Left */}
            <div className="absolute -left-20 top-16 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-slow hidden md:flex">
              <div className="text-yellow-500 mt-0.5"><span className="material-symbols-outlined text-[18px]">visibility</span></div>
              <div>
                <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Students losing attention</div>
                <div className="text-white/50 text-[11px]">Suggest activity break?</div>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="absolute -right-28 top-48 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-medium hidden lg:flex">
              <div className="text-[#A07CFE] mt-0.5"><span className="material-symbols-outlined text-[18px]">translate</span></div>
              <div>
                <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Switch to Hindi?</div>
                <div className="text-white/50 text-[11px]">3 students need it</div>
              </div>
            </div>

            {/* Bottom Left */}
            <div className="absolute -left-28 bottom-40 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-fast hidden md:flex">
              <div className="text-[#4ADE80] mt-0.5"><span className="material-symbols-outlined text-[18px]">auto_awesome</span></div>
              <div>
                <div className="text-white text-[13px] font-bold mb-0.5 whitespace-nowrap">Local analogy ready</div>
                <div className="text-white/50 text-[11px]">"Like a city power plant..."</div>
              </div>
            </div>

            {/* Bottom Right */}
            <div className="absolute -right-20 bottom-12 glass-card bg-[#1a1b21]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 animate-float-slow hidden sm:flex" style={{ animationDelay: '1s'}}>
              <div className="relative mt-0.5">
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,1)]"></span>
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

      {/* Infinite Marquee */}
      <section className="py-16 border-y border-white/10 bg-[#121318]/50 overflow-hidden">
        <div className="animate-marquee gap-8 px-4 flex">
          {/* Set 1 */}
          <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
            <p className="text-on-surface leading-relaxed text-lg">"My students no longer watch the clock. They watch the screen with wonder."</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src="https://i.pravatar.cc/100?img=5" alt="Ms. Priya" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-geist uppercase tracking-widest text-on-surface-variant">Ms. Priya, Mumbai</span>
            </div>
          </div>
          <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
            <p className="text-on-surface leading-relaxed text-lg">"The Hindi translation of complex bio terms is a life-saver in my rural class."</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src="https://i.pravatar.cc/100?img=11" alt="Mr. Anand" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-geist uppercase tracking-widest text-on-surface-variant">Mr. Anand, Patna</span>
            </div>
          </div>
          <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
            <p className="text-on-surface leading-relaxed text-lg">"Visual kits for physics helped me explain gravity in 5 minutes."</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src="https://i.pravatar.cc/100?img=9" alt="Ms. Elena" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-geist uppercase tracking-widest text-on-surface-variant">Ms. Elena, Toronto</span>
            </div>
          </div>
          <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
            <p className="text-on-surface leading-relaxed text-lg">"EduAgent isn't a tool, it's my co-pilot in the classroom."</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src="https://i.pravatar.cc/100?img=12" alt="Mr. David" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-geist uppercase tracking-widest text-on-surface-variant">Mr. David, London</span>
            </div>
          </div>

          {/* Duplicates for infinite scroll effect */}
          <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
            <p className="text-on-surface leading-relaxed text-lg">"My students no longer watch the clock. They watch the screen with wonder."</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src="https://i.pravatar.cc/100?img=5" alt="Ms. Priya" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-geist uppercase tracking-widest text-on-surface-variant">Ms. Priya, Mumbai</span>
            </div>
          </div>
          <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
            <p className="text-on-surface leading-relaxed text-lg">"The Hindi translation of complex bio terms is a life-saver in my rural class."</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src="https://i.pravatar.cc/100?img=11" alt="Mr. Anand" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-geist uppercase tracking-widest text-on-surface-variant">Mr. Anand, Patna</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 01: The Shift */}
      <section className="py-32 max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="fade-up">
            <span className="text-on-surface-variant font-geist uppercase tracking-widest text-xs mb-4 block">Chapter 01</span>
            <h2 className="font-geist font-medium text-[40px] leading-[1.2] tracking-tight mb-6">Your impact is human. <br /> Let us handle the data.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Education hasn't changed much in 20 years, but students have. We bridge the gap between the speed of the internet and the depth of the curriculum, freeing you to mentor rather than manage.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 fade-up">
            <div className="glass-card p-8 rounded-2xl border-white/5 opacity-80 flex gap-4">
              <div className="mt-1"><span className="material-symbols-outlined text-on-surface-variant">history</span></div>
              <div>
                <span className="text-xs font-geist text-on-surface-variant tracking-widest uppercase mb-2 block">YESTERDAY: BURNOUT</span>
                <p className="text-sm text-on-surface-variant">Endless paperwork. Routine tasks. Struggling for attention. Administrative fatigue.</p>
              </div>
            </div>
            <div className="glass-card p-8 rounded-2xl border-primary/30 relative overflow-hidden flex gap-4 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="mt-1"><span className="material-symbols-outlined text-primary">auto_awesome</span></div>
              <div className="relative z-10">
                <span className="text-xs font-geist text-primary tracking-widest uppercase mb-2 block">TODAY: EMPOWERMENT</span>
                <p className="text-on-surface font-semibold mb-1">Focus on the 'Aha!' Moments.</p>
                <p className="text-sm text-on-surface-variant">Automated insights and creative aids that let you lead with inspiration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* The Challenge Section */}
      <section className="py-32 px-6 relative overflow-hidden bg-[#0d0e13] border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto fade-up relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="font-geist font-semibold text-[40px] md:text-[48px] leading-[1.2] tracking-tight text-white mb-6">
              Teachers were never trained <br className="hidden md:block"/> for this generation.
            </h2>
            <p className="font-sans text-[20px] leading-relaxed text-on-surface-variant max-w-3xl mx-auto">
              They're now expected to do everything a stage performer, a content creator, and a coach does — alone, in real-time, with no contextual support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <div className="w-14 h-14 rounded-full bg-[#cfbcff]/10 flex items-center justify-center border border-[#cfbcff]/20 shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_0_20px_rgba(207,188,255,0.1)]">
                <span className="material-symbols-outlined text-[#cfbcff] text-[24px]">smartphone</span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">Compete with infinite feeds</span>
            </div>

            {/* Card 2 */}
            <div className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <div className="w-14 h-14 rounded-full bg-[#ffb2ba]/10 flex items-center justify-center border border-[#ffb2ba]/20 shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_0_20px_rgba(255,178,186,0.1)]">
                <span className="material-symbols-outlined text-[#ffb2ba] text-[24px]">visibility</span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">Hold attention by the second</span>
            </div>

            {/* Card 3 */}
            <div className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <div className="w-14 h-14 rounded-full bg-[#ecc161]/10 flex items-center justify-center border border-[#ecc161]/20 shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_0_20px_rgba(236,193,97,0.1)]">
                <span className="material-symbols-outlined text-[#ecc161] text-[24px]">group</span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">Personalize for every learner</span>
            </div>

            {/* Card 4 */}
            <div className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <div className="w-14 h-14 rounded-full bg-[#a07cfe]/10 flex items-center justify-center border border-[#a07cfe]/20 shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_0_20px_rgba(160,124,254,0.1)]">
                <span className="material-symbols-outlined text-[#a07cfe] text-[24px]">auto_awesome</span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">Create experiences, not lectures</span>
            </div>

            {/* Card 5 */}
            <div className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <div className="w-14 h-14 rounded-full bg-[#ff97a4]/10 flex items-center justify-center border border-[#ff97a4]/20 shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_0_20px_rgba(255,151,164,0.1)]">
                <span className="material-symbols-outlined text-[#ff97a4] text-[24px]">show_chart</span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">Manage engagement live</span>
            </div>

            {/* Card 6 */}
            <div className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <div className="w-14 h-14 rounded-full bg-[#b48d33]/10 flex items-center justify-center border border-[#b48d33]/20 shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_0_20px_rgba(180,141,51,0.1)]">
                <span className="material-symbols-outlined text-[#b48d33] text-[24px]">psychology</span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">Adapt in real-time</span>
            </div>
          </div>

          <div className="text-center relative">
            <h3 className="font-geist text-[32px] font-medium leading-[1.3] tracking-[-0.01em] text-on-surface">
              The system never gave them tools for this shift — <br className="hidden md:block"/> <span className="signature-gradient font-bold">so we built one.</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Experience Section (Live Classroom Mode) */}
      <section id="experience" className="py-32 px-6 border-y border-white/5 bg-[#0d0e13] scroll-mt-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto fade-up relative z-10">
          <div className="text-center mb-20">
            <span className="text-[#A855F7] font-geist uppercase tracking-widest text-[11px] mb-6 block font-bold">LIVE CLASSROOM MODE</span>
            <h2 className="font-geist font-bold text-[48px] md:text-[64px] leading-[1.1] tracking-tight mb-8">
              <span className="text-white">A calm presence beside you.</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#4ADE80]">Never in your way.</span>
            </h2>
            <p className="text-on-surface-variant text-[17px] leading-relaxed max-w-2xl mx-auto">
              Think Jarvis for teachers — except it whispers. EduAgent listens to the class, reads the energy, and surfaces only what matters in the moment.
            </p>
          </div>

          {/* Premium UI Mockup */}
          <div className="max-w-5xl mx-auto rounded-[2rem] flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            {/* Left Side: Board Context */}
            <div className="md:w-[55%] bg-[#08181A] p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-16 relative z-10">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></div>
                <span className="text-[11px] font-geist tracking-widest uppercase text-white/70 font-bold">LIVE · 10:34 AM · CLASS 8B</span>
              </div>

              <div className="flex-1 flex items-center justify-center relative z-10 mb-16">
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                  <div className="text-center">
                    <span className="text-[10px] font-geist tracking-[0.2em] uppercase text-white/40 block mb-6 font-bold">ON THE BOARD</span>
                    <h3 className="text-[28px] font-bold text-white mb-3 tracking-tight">Cell Anatomy: Mitochondria</h3>
                    <p className="text-white/50 text-[15px]">→ Powerhouse of the cell (ATP)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between relative z-10 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center text-background-deep font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)]">P</div>
                  <div>
                    <div className="font-bold text-white text-[15px] mb-0.5">Ms. Priya</div>
                    <div className="text-[12px] text-white/50">teaching · 6 min in</div>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] cursor-pointer hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-white text-2xl">mic</span>
                </div>
              </div>
            </div>

            {/* Right Side: Feed (Dark Theme Equivalent) */}
            <div className="md:w-[45%] bg-[#121318] p-8 flex flex-col border-l border-white/5">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[11px] font-geist tracking-widest uppercase text-white/50 font-bold">EDUAGENT · LIVE STREAM</span>
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">Listening</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Item 1 */}
                <div className="glass-card bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                    <span className="material-symbols-outlined text-yellow-500 text-[18px]">show_chart</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-[14px] font-semibold">Energy dropping in back row</h4>
                      <span className="text-white/30 text-[11px] font-mono">6:02</span>
                    </div>
                    <p className="text-white/50 text-[12px]">Try a 30-sec movement break</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="glass-card bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <span className="material-symbols-outlined text-purple-400 text-[18px]">translate</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-[14px] font-semibold">3 students need Hindi</h4>
                      <span className="text-white/30 text-[11px] font-mono">6:04</span>
                    </div>
                    <p className="text-white/50 text-[12px]">Switch analogy to Hindi?</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="glass-card bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20">
                    <span className="material-symbols-outlined text-teal-400 text-[18px]">auto_awesome</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-[14px] font-semibold">Local analogy ready</h4>
                      <span className="text-white/30 text-[11px] font-mono">6:06</span>
                    </div>
                    <p className="text-white/50 text-[12px]">"Like a city's main power plant"</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="glass-card bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <span className="material-symbols-outlined text-purple-400 text-[18px]">chat_bubble</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-[14px] font-semibold">Question prompt</h4>
                      <span className="text-white/30 text-[11px] font-mono">6:07</span>
                    </div>
                    <p className="text-white/50 text-[12px]">Ask: what's the "power plant" of your body?</p>
                  </div>
                </div>

                {/* Item 5 - Active Highlight */}
                <div className="glass-card bg-[#022C22] border border-[#059669]/50 rounded-2xl p-4 flex gap-4 items-start shadow-[0_0_20px_rgba(5,150,105,0.2)]">
                  <div className="w-10 h-10 rounded-full bg-[#059669]/20 flex items-center justify-center shrink-0 border border-[#059669]/50">
                    <span className="material-symbols-outlined text-[#34D399] text-[18px]">pan_tool</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-[14px] font-bold">Recover attention</h4>
                      <span className="text-white/50 text-[11px] font-mono">6:08</span>
                    </div>
                    <p className="text-[#34D399] text-[12px] font-medium">Tap to launch quick poll</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* India-Ready Stats */}
      <section className="py-24 border-y border-white/5 bg-[#0d0e13]">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center fade-up">
          <div>
            <div className="text-5xl font-geist font-medium signature-gradient mb-3">24</div>
            <div className="text-on-surface-variant uppercase tracking-widest text-xs font-geist">States Covered</div>
          </div>
          <div>
            <div className="text-5xl font-geist font-medium signature-gradient mb-3">11</div>
            <div className="text-on-surface-variant uppercase tracking-widest text-xs font-geist">Indian Languages</div>
          </div>
          <div>
            <div className="text-5xl font-geist font-medium signature-gradient mb-3">12.4K</div>
            <div className="text-on-surface-variant uppercase tracking-widest text-xs font-geist">Teachers Empowered</div>
          </div>
          <div>
            <div className="text-5xl font-geist font-medium signature-gradient mb-3">380K</div>
            <div className="text-on-surface-variant uppercase tracking-widest text-xs font-geist">Active Students</div>
          </div>
        </div>
      </section>

      {/* How EduAgent Works (Timeline) */}
      <section id="features" className="py-32 px-6 border-b border-white/5 scroll-mt-24">
        <div className="max-w-[1280px] mx-auto fade-up">
          <div className="mb-20">
            <span className="text-primary font-geist uppercase tracking-widest text-[11px] mb-6 block font-bold">HOW EDUAGENT WORKS</span>
            <h2 className="font-geist font-medium text-[40px] md:text-[56px] leading-[1.1] tracking-tight">
              From the first tap to the <br className="hidden md:block" />
              <span className="signature-gradient">next great lesson.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-8 relative">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col gap-8 items-center md:items-start text-center md:text-left">
              <div className="hidden md:block absolute top-8 left-16 right-[-2rem] h-[1px] border-t border-dashed border-white/15 -z-10"></div>
              <div className="w-16 h-16 rounded-full glass-card border border-white/5 flex items-center justify-center bg-[#1a1b21]/80">
                <span className="material-symbols-outlined text-primary text-2xl">play_circle</span>
              </div>
              <div>
                <span className="text-[11px] font-geist text-on-surface tracking-widest uppercase mb-3 block font-bold">STEP 1</span>
                <h3 className="text-lg md:text-[22px] font-bold mb-3 text-on-surface tracking-tight leading-tight">Teacher starts session</h3>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed pr-2">60 seconds. One tap. Class is ready.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col gap-8 items-center md:items-start text-center md:text-left">
              <div className="hidden md:block absolute top-8 left-16 right-[-2rem] h-[1px] border-t border-dashed border-white/15 -z-10"></div>
              <div className="w-16 h-16 rounded-full glass-card border border-white/5 flex items-center justify-center bg-[#1a1b21]/80">
                <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
              </div>
              <div>
                <span className="text-[11px] font-geist text-on-surface tracking-widest uppercase mb-3 block font-bold">STEP 2</span>
                <h3 className="text-lg md:text-[22px] font-bold mb-3 text-on-surface tracking-tight leading-tight">AI adapts to the room</h3>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed pr-2">Energy, language, and pace — read in real-time.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col gap-8 items-center md:items-start text-center md:text-left">
              <div className="hidden md:block absolute top-8 left-16 right-[-2rem] h-[1px] border-t border-dashed border-white/15 -z-10"></div>
              <div className="w-16 h-16 rounded-full glass-card border border-white/5 flex items-center justify-center bg-[#1a1b21]/80">
                <span className="material-symbols-outlined text-primary text-2xl">group</span>
              </div>
              <div>
                <span className="text-[11px] font-geist text-on-surface tracking-widest uppercase mb-3 block font-bold">STEP 3</span>
                <h3 className="text-lg md:text-[22px] font-bold mb-3 text-on-surface tracking-tight leading-tight">Students engage</h3>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed pr-2">Hooks, loops, and anchors keep them in.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col gap-8 items-center md:items-start text-center md:text-left">
              <div className="hidden md:block absolute top-8 left-16 right-[-2rem] h-[1px] border-t border-dashed border-white/15 -z-10"></div>
              <div className="w-16 h-16 rounded-full glass-card border border-white/5 flex items-center justify-center bg-[#1a1b21]/80">
                <span className="material-symbols-outlined text-primary text-2xl">favorite</span>
              </div>
              <div>
                <span className="text-[11px] font-geist text-on-surface tracking-widest uppercase mb-3 block font-bold">STEP 4</span>
                <h3 className="text-lg md:text-[22px] font-bold mb-3 text-on-surface tracking-tight leading-tight">Teacher reflects</h3>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed pr-2">Voice journaling, not corporate dashboards.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative z-10 flex flex-col gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-16 h-16 rounded-full glass-card border border-white/5 flex items-center justify-center bg-[#1a1b21]/80">
                <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
              </div>
              <div>
                <span className="text-[11px] font-geist text-on-surface tracking-widest uppercase mb-3 block font-bold">STEP 5</span>
                <h3 className="text-lg md:text-[22px] font-bold mb-3 text-on-surface tracking-tight leading-tight">System evolves</h3>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed pr-2">Every class makes the next one better.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reflection (Teacher Evolution) */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center fade-up relative z-10">
          <div className="max-w-xl">
            <span className="text-primary font-geist uppercase tracking-widest text-[11px] mb-6 block font-bold">TEACHER EVOLUTION</span>
            <h2 className="font-geist font-bold text-[48px] md:text-[64px] leading-[1.1] tracking-tight mb-8">
              <span className="text-white">Not analytics.</span> <br />
              <span className="text-white/40">A gentle mirror.</span>
            </h2>
            <p className="text-on-surface-variant text-[17px] leading-relaxed">
              After each class, EduAgent offers a quiet reflection — what worked, what to try next, what your students felt. No scores. No leaderboards. Just growth.
            </p>
          </div>

          <div className="glass-card p-10 md:p-12 rounded-[2.5rem] border border-white/5 relative group bg-[#121318]/60 shadow-2xl backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-[2.5rem] pointer-events-none"></div>
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 rounded-full bg-[#F59E0B] flex items-center justify-center text-background-deep font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">P</div>
                <div>
                  <div className="font-bold text-white text-[17px] mb-1">Ms. Priya's reflection</div>
                  <div className="text-[13px] text-white/50">Tuesday · 11:12 AM · Human Cell Anatomy</div>
                </div>
              </div>

              {/* Your Moment */}
              <div className="bg-[#1a1b21]/80 rounded-3xl p-8 mb-10 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#F59E0B] to-transparent opacity-70"></div>
                <div className="text-[#F59E0B] font-geist uppercase tracking-[0.2em] text-[11px] mb-4 font-bold">YOUR MOMENT</div>
                <p className="text-white/90 leading-relaxed text-[17px]">"The city power plant analogy for mitochondria made the back row sit up. That's the one to keep."</p>
              </div>

              {/* List */}
              <div className="space-y-7 mb-10 pl-2">
                <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
                  <div className="flex items-center gap-3 text-[11px] font-geist uppercase tracking-widest text-white/50 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    What Landed
                  </div>
                  <div className="text-white text-[15px] font-medium">Local analogies + visual diagram</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
                  <div className="flex items-center gap-3 text-[11px] font-geist uppercase tracking-widest text-white/50 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    Try Next Time
                  </div>
                  <div className="text-white text-[15px] font-medium">Quick poll after the hook</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
                  <div className="flex items-center gap-3 text-[11px] font-geist uppercase tracking-widest text-white/50 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    Class Felt
                  </div>
                  <div className="text-white text-[15px] font-medium">Curious · Engaged · A little tired</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-8 border-t border-white/5 text-[13px] text-white/40">
                <div>Week 3 · 8 reflections</div>
                <div className="flex items-center gap-2 text-[#10B981] font-medium">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                  Growing steadily
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative z-10 overflow-hidden bg-[#0d0e13] border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto fade-up flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="font-geist font-bold text-[48px] md:text-[64px] leading-[1.1] tracking-tight mb-10 text-white">Ready to transform <br className="hidden md:block" /> your classroom?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <button className="px-10 py-4 rounded-full gradient-button text-background-deep font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.3)] w-full sm:w-auto">
                Join the Waitlist
              </button>
              <button className="px-10 py-4 rounded-full ghost-border text-on-surface font-bold hover:bg-white/5 transition-all w-full sm:w-auto">
                Book a Live Demo
              </button>
            </div>
            <p className="text-on-surface-variant text-sm tracking-wide">Free for the first 100 schools in each state.</p>
          </div>
          
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end relative h-[400px] items-center">
            <DisplayCards cards={[
              {
                icon: <span className="material-symbols-outlined text-[#cfbcff] text-[20px]">auto_awesome</span>,
                title: "AI Co-pilot",
                description: "Always learning, always ready",
                date: "Active",
                titleClassName: "text-[#cfbcff]",
                className:
                  "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#0d0e13]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
              },
              {
                icon: <span className="material-symbols-outlined text-[#ffb2ba] text-[20px]">insights</span>,
                title: "Live Analytics",
                description: "Real-time class engagement",
                date: "Updating...",
                titleClassName: "text-[#ffb2ba]",
                className:
                  "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#0d0e13]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
              },
              {
                icon: <span className="material-symbols-outlined text-[#ecc161] text-[20px]">psychology</span>,
                title: "Adaptive Learning",
                description: "Personalized paths for everyone",
                date: "v2.4 Deployed",
                titleClassName: "text-[#ecc161]",
                className:
                  "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
              },
            ]} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-deep border-t border-white/10 py-16 px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
                <span className="material-symbols-outlined text-background-deep text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-on-surface">EduAgent</span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 pr-4">
              Empowering the next generation of educators with delightfully smart AI.
            </p>
          </div>
          
          <div>
            <h4 className="text-on-surface font-bold mb-6 text-sm">Product</h4>
            <ul className="flex flex-col gap-4">
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Vision</a></li>
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Features</a></li>
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-on-surface font-bold mb-6 text-sm">India</h4>
            <ul className="flex flex-col gap-4">
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Language Support</a></li>
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Rural Education</a></li>
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Impact Stories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-on-surface font-bold mb-6 text-sm">Company</h4>
            <ul className="flex flex-col gap-4">
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Privacy Policy</a></li>
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Terms of Service</a></li>
              <li><a className="text-on-surface-variant hover:text-white transition-colors text-sm" href="#">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-[1280px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-on-surface-variant opacity-80 font-geist">© 2026 EduAgent AI. Empowering the next generation of educators.</span>
          <div className="flex gap-6">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-xl">public</span></a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-xl">alternate_email</span></a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-xl">share</span></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
