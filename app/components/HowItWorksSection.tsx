"use client";

const steps = [
  {
    icon: "play_circle",
    step: "Step 1",
    title: "Teacher starts session",
    body: "60 seconds. One tap. Class is ready.",
    showConnector: true,
  },
  {
    icon: "psychology",
    step: "Step 2",
    title: "AI adapts to the room",
    body: "Energy, language, and pace — read in real-time.",
    showConnector: true,
  },
  {
    icon: "group",
    step: "Step 3",
    title: "Students engage",
    body: "Hooks, loops, and anchors keep them in.",
    showConnector: true,
  },
  {
    icon: "favorite",
    step: "Step 4",
    title: "Teacher reflects",
    body: "Voice journaling, not corporate dashboards.",
    showConnector: true,
  },
  {
    icon: "auto_awesome",
    step: "Step 5",
    title: "System evolves",
    body: "Every class makes the next one better.",
    showConnector: false,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="features"
      className="py-32 px-6 border-b border-white/5 scroll-mt-24"
    >
      <div className="max-w-[1280px] mx-auto fade-up">
        {/* Header */}
        <div className="mb-20">
          <span className="text-primary uppercase tracking-widest text-[11px] mb-6 block font-bold">
            How EduAgent Works
          </span>
          <h2 className="font-medium text-[40px] md:text-[56px] leading-[1.1] tracking-tight">
            From the first tap to the <br className="hidden md:block" />
            <span className="signature-gradient">next great lesson.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-8 relative">
          {steps.map((s) => (
            <div
              key={s.step}
              className="relative z-10 flex flex-col gap-8 items-center md:items-start text-center md:text-left"
            >
              {/* Dashed connector line (not on last step) */}
              {s.showConnector && (
                <div className="hidden md:block absolute top-8 left-16 right-[-2rem] h-[1px] border-t border-dashed border-white/15 -z-10" />
              )}

              {/* Icon circle */}
              <div className="w-16 h-16 rounded-full glass-card border border-white/5 flex items-center justify-center bg-[#1a1b21]/80">
                <span className="material-symbols-outlined text-primary text-2xl">{s.icon}</span>
              </div>

              {/* Text */}
              <div>
                <span className="text-[11px] text-on-surface tracking-widest uppercase mb-3 block font-bold">
                  {s.step}
                </span>
                <h3 className="text-lg md:text-[22px] font-bold mb-3 text-on-surface tracking-tight leading-tight">
                  {s.title}
                </h3>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed pr-2">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
