"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardNav from "../components/DashboardNav";
import PageLoader from "../components/PageLoader";
import SignoutConfirmModal from "../components/SignoutConfirmModal";
import { LogOut, History, Clock, Users, BookOpen, BrainCircuit, SidebarClose, ChevronRight, Activity, TrendingUp } from "lucide-react";

import { getStudentClassrooms, Classroom } from "../../lib/firestore";

// ── Teacher Types ──
interface ParticipantPerformance {
  name: string;
  avatarSeed: string;
  engagement: string;
  performance: string;
  insight: string;
}

interface PastMeeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  code: string;
  participantsCount: number;
  participants: ParticipantPerformance[];
  aiSummary: string;
}

const mockPastMeetings: PastMeeting[] = [
  {
    id: "m-1",
    title: "Algebraic Foundations & Quadratic Equations",
    date: "June 17, 2026",
    duration: "45 mins",
    code: "classroom-math-a3f9",
    participantsCount: 4,
    aiSummary: "The class demonstrated high engagement during the interactive quadratic visualizer sandbox. Sophia Martinez struggled with quadratic formulas but showed progress after assignment modifications. Recommended assignment: 3 supplementary exercises on vertex calculations.",
    participants: [
      { name: "Emily Watson", avatarSeed: "Emily", engagement: "98%", performance: "95%", insight: "Demonstrated full mastery of factoring." },
      { name: "Marcus Chen", avatarSeed: "Marcus", engagement: "92%", performance: "88%", insight: "Active participation in solving equations." },
      { name: "Sophia Martinez", avatarSeed: "Sophia", engagement: "85%", performance: "74%", insight: "Requires follow-up review on vertex formula." },
      { name: "Oliver Bennett", avatarSeed: "Oliver", engagement: "64%", performance: "60%", insight: "Low attention during lecture; active in sandbox." },
    ],
  },
  {
    id: "m-2",
    title: "Introductory Chemistry Lab: Covalent Bonding",
    date: "June 15, 2026",
    duration: "60 mins",
    code: "classroom-chem-982c",
    participantsCount: 5,
    aiSummary: "Very successful session. Everyone connected and collaborated on the virtual molecule builder. Liam O'Connor and Emily Watson completed all advanced combinations. Assign lesson 4 overview as next homework.",
    participants: [
      { name: "Emily Watson", avatarSeed: "Emily", engagement: "100%", performance: "100%", insight: "Excellent speed in compound construction." },
      { name: "Marcus Chen", avatarSeed: "Marcus", engagement: "90%", performance: "85%", insight: "Followed safety simulation steps correctly." },
      { name: "Sophia Martinez", avatarSeed: "Sophia", engagement: "88%", performance: "80%", insight: "Constructed standard covalent bonds correctly." },
      { name: "Oliver Bennett", avatarSeed: "Oliver", engagement: "72%", performance: "65%", insight: "Completed basic compounds; missed review session." },
      { name: "Liam O'Connor", avatarSeed: "Liam", engagement: "96%", performance: "95%", insight: "Helped peers solve compound structure puzzles." },
    ],
  },
];

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedMeeting, setSelectedMeeting] = useState<PastMeeting | null>(mockPastMeetings[0]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [confirmSignoutOpen, setConfirmSignoutOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "student") {
      getStudentClassrooms(user.uid).then(setClassrooms).catch(console.error);
    }
  }, [user]);

  if (loading || !user) return <PageLoader message="Loading your profile..." />;

  const isTeacher = user.role === "teacher" || !user.role; // Default legacy accounts to teacher if role missing
  
  const teacherStats = [
    { value: "24", label: "Sessions Hosted", color: "#cfbcff" },
    { value: "18.5h", label: "Classroom Hours", color: "#cfbcff" },
    { value: "92%", label: "Avg Engagement", color: "#4ade80" },
  ];

  const studentStats = [
    { value: "3", label: "Active Courses", color: "#38bdf8" },
    { value: "14", label: "Day Streak", color: "#f59e0b" },
    { value: "A-", label: "Average Grade", color: "#4ade80" },
  ];

  const profileStats = isTeacher ? teacherStats : studentStats;
  const badgeText = isTeacher ? "Certified Educator" : "Student Profile";
  const badgeColor = isTeacher ? "#cfbcff" : "#38bdf8";
  const badgeBg = isTeacher ? "rgba(160,124,254,0.1)" : "rgba(56,189,248,0.1)";
  const badgeBorder = isTeacher ? "rgba(160,124,254,0.25)" : "rgba(56,189,248,0.25)";

  return (
    <div className="flex min-h-screen flex-col bg-background-deep text-on-surface">
      <DashboardNav />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-6 lg:p-8">

        {/* Profile Banner */}
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName || "user")}`}
              alt="Profile Avatar"
              className="h-20 w-20 shrink-0 rounded-full border-4 object-cover"
              style={{ borderColor: badgeBorder, backgroundColor: "rgba(255,255,255,0.05)" }}
            />
            <div className="flex flex-col items-start gap-1">
              <span className="rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: badgeColor, backgroundColor: badgeBg, borderColor: badgeBorder }}>
                {badgeText}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {user.displayName || (isTeacher ? "Educator Profile" : "Student Profile")}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {user.email}
              </p>
              <button
                onClick={() => setConfirmSignoutOpen(true)}
                className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 items-center gap-6 rounded-xl border border-white/5 bg-black/20 p-5 backdrop-blur-sm sm:gap-8">
            {profileStats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 sm:gap-8">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
                </div>
                {i < profileStats.length - 1 && (
                  <div className="h-10 w-px bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content based on Role */}
        {isTeacher ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Past Sessions List */}
            <div className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm lg:col-span-5">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-white">Past Meeting Archive</h3>
                </div>
                <p className="text-sm text-on-surface-variant">Select a session to inspect student performance.</p>
              </div>

              <div className="flex flex-col gap-3">
                {mockPastMeetings.map((mtg) => {
                  const isSelected = selectedMeeting?.id === mtg.id;
                  return (
                    <div
                      key={mtg.id}
                      onClick={() => setSelectedMeeting(mtg)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected 
                        ? "border-primary/30 bg-primary/10 shadow-inner" 
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className={`text-sm font-bold leading-snug ${isSelected ? "text-primary" : "text-white"}`}>{mtg.title}</h4>
                        <span className="shrink-0 text-xs text-on-surface-variant">{mtg.date}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-on-surface-variant/70" />
                          {mtg.duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-on-surface-variant/70" />
                          {mtg.participantsCount} participants
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session Detail */}
            <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm lg:col-span-7">
              {selectedMeeting ? (
                <>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Session Report</span>
                    <h2 className="mt-1 text-xl font-bold text-white">{selectedMeeting.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-on-surface-variant">
                      Room: <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">{selectedMeeting.code}</code>
                      <span className="text-white/20">•</span> {selectedMeeting.date}
                    </p>
                  </div>

                  {/* AI Summary */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                      <strong className="text-sm text-primary">AI Classroom Summary & Recommendations</strong>
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{selectedMeeting.aiSummary}</p>
                  </div>

                  {/* Participant list */}
                  <div>
                    <h3 className="mb-4 text-base font-bold text-white">Participant Performance Log</h3>
                    <div className="flex flex-col gap-3">
                      {selectedMeeting.participants.map((p, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                          <div className="flex w-full sm:w-48 shrink-0 items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.avatarSeed)}`} alt={p.name} className="h-9 w-9 rounded-full border border-primary/20 bg-primary/10 object-cover" />
                            <span className="text-sm font-bold text-white">{p.name}</span>
                          </div>
                          <div className="flex-1 min-w-[200px]">
                            <span className="text-xs leading-relaxed text-on-surface-variant">{p.insight}</span>
                          </div>
                          <div className="flex shrink-0 items-center justify-between sm:justify-end gap-6 sm:w-32">
                            <div className="flex flex-col text-left sm:text-right">
                              <span className="text-[0.6rem] font-bold uppercase text-on-surface-variant">Engagement</span>
                              <span className="text-sm font-bold text-primary">{p.engagement}</span>
                            </div>
                            <div className="flex flex-col text-left sm:text-right">
                              <span className="text-[0.6rem] font-bold uppercase text-on-surface-variant">Score</span>
                              <span className="text-sm font-bold text-emerald-400">{p.performance}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-on-surface-variant">
                  <SidebarClose className="h-10 w-10 opacity-50" />
                  <span className="text-sm">Select a past session to view logs.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-bold text-white">Enrolled Classes</h3>
              </div>
              <p className="text-sm text-on-surface-variant">Manage your current curriculum.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {classrooms.length > 0 ? classrooms.map(course => (
                <div key={course.id} className="group flex flex-col gap-5 rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-secondary/30">
                  <div>
                    <h4 className="text-base font-bold text-white">{course.name}</h4>
                    <p className="mt-0.5 text-xs text-on-surface-variant">Instructor: {course.teacherName}</p>
                  </div>
                  
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                      <span className="font-semibold">Course Progress</span>
                      <span className="font-bold">85%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `85%` }} />
                    </div>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant">Next Up</span>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white">
                        Pending Assignments
                        <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant/50 group-hover:text-white transition-colors" />
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-400/10 px-3 py-1.5 text-sm font-extrabold text-emerald-400">
                      A-
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-on-surface-variant">
                  You haven't enrolled in any classrooms yet. Use a code from your teacher to join on the Dashboard!
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer className="mt-auto border-t border-white/5 py-6 text-center text-xs text-on-surface-variant">
        © 2026 EduAgent AI. All rights reserved.
      </footer>

      <SignoutConfirmModal
        isOpen={confirmSignoutOpen}
        onClose={() => setConfirmSignoutOpen(false)}
        onConfirm={async () => {
          setConfirmSignoutOpen(false);
          await logout();
          router.push("/");
        }}
      />
    </div>
  );
}
