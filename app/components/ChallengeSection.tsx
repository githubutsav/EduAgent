"use client";

const challenges = [
  { icon: "smartphone", label: "Compete with infinite feeds", color: "#cfbcff", bg: "#cfbcff" },
  { icon: "visibility", label: "Hold attention by the second", color: "#ffb2ba", bg: "#ffb2ba" },
  { icon: "group", label: "Personalize for every learner", color: "#ecc161", bg: "#ecc161" },
  { icon: "auto_awesome", label: "Create experiences, not lectures", color: "#a07cfe", bg: "#a07cfe" },
  { icon: "show_chart", label: "Manage engagement live", color: "#ff97a4", bg: "#ff97a4" },
  { icon: "psychology", label: "Adapt in real-time", color: "#b48d33", bg: "#b48d33" },
];

export default function ChallengeSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-[#0d0e13] border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto fade-up relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="font-semibold text-[40px] md:text-[48px] leading-[1.2] tracking-tight text-white mb-6">
            Teachers were never trained <br className="hidden md:block" /> for this generation.
          </h2>
          <p className="text-[20px] leading-relaxed text-on-surface-variant max-w-3xl mx-auto">
            They&apos;re now expected to do everything a stage performer, a content creator,
            and a coach does — alone, in real-time, with no contextual support.
          </p>
        </div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 max-w-5xl mx-auto">
          {challenges.map((c) => (
            <div
              key={c.label}
              className="glass-card rounded-2xl p-8 flex items-center gap-5 hover:bg-white/[0.05] hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: `${c.color}1a`,
                  borderColor: `${c.color}33`,
                  boxShadow: `inset 0 0 20px ${c.color}1a`,
                }}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ color: c.color }}
                >
                  {c.icon}
                </span>
              </div>
              <span className="text-on-surface font-medium text-lg group-hover:text-white transition-colors">
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Closing statement */}
        <div className="text-center">
          <h3 className="text-[32px] font-medium leading-[1.3] tracking-[-0.01em] text-on-surface">
            The system never gave them tools for this shift —{" "}
            <br className="hidden md:block" />
            <span className="signature-gradient font-bold">so we built one.</span>
          </h3>
        </div>
      </div>
    </section>
  );
}
