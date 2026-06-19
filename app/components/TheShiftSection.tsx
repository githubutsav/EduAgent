"use client";

export default function TheShiftSection() {
  return (
    <section className="py-32 max-w-[1280px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <div className="fade-up">
          <span className="text-on-surface-variant uppercase tracking-widest text-xs mb-4 block">
            Chapter 01
          </span>
          <h2 className="font-medium text-[40px] leading-[1.2] tracking-tight mb-6">
            Your impact is human. <br /> Let us handle the data.
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Education hasn&apos;t changed much in 20 years, but students have. We bridge
            the gap between the speed of the internet and the depth of the curriculum,
            freeing you to mentor rather than manage.
          </p>
        </div>

        {/* Right: Cards */}
        <div className="grid grid-cols-1 gap-6 fade-up">
          {/* Yesterday */}
          <div className="glass-card p-8 rounded-2xl border-white/5 opacity-80 flex gap-4">
            <div className="mt-1">
              <span className="material-symbols-outlined text-on-surface-variant">history</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant tracking-widest uppercase mb-2 block">
                Yesterday: Burnout
              </span>
              <p className="text-sm text-on-surface-variant">
                Endless paperwork. Routine tasks. Struggling for attention.
                Administrative fatigue.
              </p>
            </div>
          </div>

          {/* Today */}
          <div className="glass-card p-8 rounded-2xl border-primary/30 relative overflow-hidden flex gap-4 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="mt-1">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <div className="relative z-10">
              <span className="text-xs text-primary tracking-widest uppercase mb-2 block">
                Today: Empowerment
              </span>
              <p className="text-on-surface font-semibold mb-1">
                Focus on the &lsquo;Aha!&rsquo; Moments.
              </p>
              <p className="text-sm text-on-surface-variant">
                Automated insights and creative aids that let you lead with inspiration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
