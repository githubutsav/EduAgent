"use client";

export default function ReflectionSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center fade-up relative z-10">
        {/* Left: Text */}
        <div className="max-w-xl">
          <span className="text-primary uppercase tracking-widest text-[11px] mb-6 block font-bold">
            Teacher Evolution
          </span>
          <h2 className="font-bold text-[48px] md:text-[64px] leading-[1.1] tracking-tight mb-8">
            <span className="text-white">Not analytics.</span> <br />
            <span className="text-white/40">A gentle mirror.</span>
          </h2>
          <p className="text-on-surface-variant text-[17px] leading-relaxed">
            After each class, EduAgent offers a quiet reflection — what worked, what to try
            next, what your students felt. No scores. No leaderboards. Just growth.
          </p>
        </div>

        {/* Right: Reflection Card */}
        <div className="glass-card p-10 md:p-12 rounded-[2.5rem] border border-white/5 relative group bg-[#121318]/60 shadow-2xl backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-[2.5rem] pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#090A0F] font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                P
              </div>
              <div>
                <div className="font-bold text-white text-[17px] mb-1">Ms. Priya&apos;s reflection</div>
                <div className="text-[13px] text-white/50">Tuesday · 11:12 AM · Human Cell Anatomy</div>
              </div>
            </div>

            {/* Your Moment */}
            <div className="bg-[#1a1b21]/80 rounded-3xl p-8 mb-10 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#F59E0B] to-transparent opacity-70" />
              <div className="text-[#F59E0B] uppercase tracking-[0.2em] text-[11px] mb-4 font-bold">
                Your Moment
              </div>
              <p className="text-white/90 leading-relaxed text-[17px]">
                &ldquo;The city power plant analogy for mitochondria made the back row sit up.
                That&apos;s the one to keep.&rdquo;
              </p>
            </div>

            {/* Insight list */}
            <div className="space-y-7 mb-10 pl-2">
              {[
                { dot: "#10B981", label: "What Landed", value: "Local analogies + visual diagram" },
                { dot: "#F59E0B", label: "Try Next Time", value: "Quick poll after the hook" },
                { dot: "#A855F7", label: "Class Felt", value: "Curious · Engaged · A little tired" },
              ].map((item) => (
                <div key={item.label} className="grid grid-cols-[140px_1fr] gap-6 items-start">
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/50 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: item.dot,
                        boxShadow: `0 0 10px ${item.dot}80`,
                      }}
                    />
                    {item.label}
                  </div>
                  <div className="text-white text-[15px] font-medium">{item.value}</div>
                </div>
              ))}
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
  );
}
