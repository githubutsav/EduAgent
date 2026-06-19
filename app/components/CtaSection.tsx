"use client";

import DisplayCards from "./ui/display-cards";

export default function CtaSection() {
  return (
    <section className="py-32 px-6 relative z-10 overflow-hidden bg-[#0d0e13] border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto fade-up flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        {/* Left: CTA Text */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <h2 className="font-bold text-[48px] md:text-[64px] leading-[1.1] tracking-tight mb-10 text-white">
            Ready to transform <br className="hidden md:block" /> your classroom?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
            <button className="px-10 py-4 rounded-full gradient-button text-[#090A0F] font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.3)] w-full sm:w-auto">
              Join the Waitlist
            </button>
            <button className="px-10 py-4 rounded-full ghost-border text-on-surface font-bold hover:bg-white/5 transition-all w-full sm:w-auto">
              Book a Live Demo
            </button>
          </div>
          <p className="text-on-surface-variant text-sm tracking-wide">
            Free for the first 100 schools in each state.
          </p>
        </div>

        {/* Right: Display Cards */}
        <div className="lg:w-1/2 w-full flex justify-center lg:justify-end relative h-[400px] items-center">
          <DisplayCards
            cards={[
              {
                icon: (
                  <span className="material-symbols-outlined text-[#cfbcff] text-[20px]">
                    auto_awesome
                  </span>
                ),
                title: "AI Co-pilot",
                description: "Always learning, always ready",
                date: "Active",
                titleClassName: "text-[#cfbcff]",
                className:
                  "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#0d0e13]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
              },
              {
                icon: (
                  <span className="material-symbols-outlined text-[#ffb2ba] text-[20px]">
                    insights
                  </span>
                ),
                title: "Live Analytics",
                description: "Real-time class engagement",
                date: "Updating...",
                titleClassName: "text-[#ffb2ba]",
                className:
                  "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#0d0e13]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
              },
              {
                icon: (
                  <span className="material-symbols-outlined text-[#ecc161] text-[20px]">
                    psychology
                  </span>
                ),
                title: "Adaptive Learning",
                description: "Personalized paths for everyone",
                date: "v2.4 Deployed",
                titleClassName: "text-[#ecc161]",
                className:
                  "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
