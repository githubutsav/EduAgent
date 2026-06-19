"use client";

const stats = [
  { value: "24", label: "States Covered" },
  { value: "11", label: "Indian Languages" },
  { value: "12.4K", label: "Teachers Empowered" },
  { value: "380K", label: "Active Students" },
];

export default function IndiaStatsSection() {
  return (
    <section className="py-24 border-y border-white/5 bg-[#0d0e13]">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center fade-up">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-5xl font-medium signature-gradient mb-3">{s.value}</div>
            <div className="text-on-surface-variant uppercase tracking-widest text-xs">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
