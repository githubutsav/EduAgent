"use client";

const feedItems = [
  {
    icon: "show_chart",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-500/10",
    iconBorder: "border-yellow-500/20",
    title: "Energy dropping in back row",
    body: "Try a 30-sec movement break",
    time: "6:02",
    highlight: false,
  },
  {
    icon: "translate",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    iconBorder: "border-purple-500/20",
    title: "3 students need Hindi",
    body: "Switch analogy to Hindi?",
    time: "6:04",
    highlight: false,
  },
  {
    icon: "auto_awesome",
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/10",
    iconBorder: "border-teal-500/20",
    title: "Local analogy ready",
    body: '"Like a city\'s main power plant"',
    time: "6:06",
    highlight: false,
  },
  {
    icon: "chat_bubble",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    iconBorder: "border-purple-500/20",
    title: "Question prompt",
    body: 'Ask: what\'s the "power plant" of your body?',
    time: "6:07",
    highlight: false,
  },
];

export default function LiveClassroomSection() {
  return (
    <section
      id="experience"
      className="py-32 px-6 border-y border-white/5 bg-[#0d0e13] scroll-mt-24 relative overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto fade-up relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-[#A855F7] uppercase tracking-widest text-[11px] mb-6 block font-bold">
            Live Classroom Mode
          </span>
          <h2 className="font-bold text-[48px] md:text-[64px] leading-[1.1] tracking-tight mb-8">
            <span className="text-white">A calm presence beside you.</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#4ADE80]">
              Never in your way.
            </span>
          </h2>
          <p className="text-on-surface-variant text-[17px] leading-relaxed max-w-2xl mx-auto">
            Think Jarvis for teachers — except it whispers. EduAgent listens to the class,
            reads the energy, and surfaces only what matters in the moment.
          </p>
        </div>

        {/* Premium UI Mockup */}
        <div className="max-w-5xl mx-auto rounded-[2rem] flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
          {/* Left: Board Context */}
          <div className="md:w-[55%] bg-[#08181A] p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center gap-2 mb-16 relative z-10">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[11px] tracking-widest uppercase text-white/70 font-bold">
                Live · 10:34 AM · Class 8B
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 mb-16">
              <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                <div className="text-center">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 block mb-6 font-bold">
                    On the Board
                  </span>
                  <h3 className="text-[28px] font-bold text-white mb-3 tracking-tight">
                    Cell Anatomy: Mitochondria
                  </h3>
                  <p className="text-white/50 text-[15px]">→ Powerhouse of the cell (ATP)</p>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between relative z-10 mt-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#090A0F] font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  P
                </div>
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

          {/* Right: Feed */}
          <div className="md:w-[45%] bg-[#121318] p-8 flex flex-col border-l border-white/5">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[11px] tracking-widest uppercase text-white/50 font-bold">
                EduAgent · Live Stream
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
                Listening
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {feedItems.map((item, i) => (
                <div
                  key={i}
                  className="glass-card bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/[0.04] transition-colors cursor-default"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0 border ${item.iconBorder}`}
                  >
                    <span className={`material-symbols-outlined ${item.iconColor} text-[18px]`}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-[14px] font-semibold">{item.title}</h4>
                      <span className="text-white/30 text-[11px] font-mono">{item.time}</span>
                    </div>
                    <p className="text-white/50 text-[12px]">{item.body}</p>
                  </div>
                </div>
              ))}

              {/* Active Highlight */}
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
  );
}
