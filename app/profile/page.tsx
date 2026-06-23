"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardNav from "../components/DashboardNav";
import PageLoader from "../components/PageLoader";
import SignoutConfirmModal from "../components/SignoutConfirmModal";
import { LogOut, History, Clock, Users, BookOpen, BrainCircuit, SidebarClose, ChevronRight, Activity, TrendingUp, Edit3 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

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



export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { userProfile, studentData, teacherData } = useAppStore();
  const { classrooms: studentClassrooms, pastQuizzes } = studentData;
  const { classrooms: teacherClassrooms, studentAnalytics } = teacherData;

  const pastClassroomSessions: PastMeeting[] = teacherClassrooms.map((c, i) => ({
    id: c.id,
    title: c.name + " Assessments",
    date: "Active",
    duration: "Live",
    code: c.roomCode,
    participantsCount: c.students ? c.students.length : 0,
    aiSummary: `Classroom dynamic summary for ${c.name}. Engagement is steady. Students are actively tracking their progress through upcoming assessments.`,
    participants: studentAnalytics.slice(0, 5).map(s => ({
      name: s.studentName || "Student",
      avatarSeed: s.studentName || "S",
      engagement: s.engagement || "0%",
      performance: s.progress ? `${s.progress}%` : "0%",
      insight: s.lastAction || "No recent activity"
    }))
  }));

  const [selectedMeeting, setSelectedMeeting] = useState<PastMeeting | null>(null);
  const [confirmSignoutOpen, setConfirmSignoutOpen] = useState(false);

  useEffect(() => {
    if (pastClassroomSessions.length > 0 && !selectedMeeting) {
      setSelectedMeeting(pastClassroomSessions[0]);
    }
  }, [pastClassroomSessions, selectedMeeting]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return <PageLoader message="Loading your profile..." />;

  const isTeacher = userProfile?.role === "teacher" || (!userProfile?.role && user?.role === "teacher");

  const avgEngagementStr = studentAnalytics.length > 0 
    ? Math.round(studentAnalytics.reduce((sum: number, s: any) => sum + parseInt(s.engagement || "0"), 0) / studentAnalytics.length) + "%"
    : "0%";

  const teacherStats = [
    { value: teacherClassrooms.length.toString(), label: "Sessions Hosted", color: "#cfbcff" },
    { value: studentAnalytics.length.toString(), label: "Students Tracked", color: "#cfbcff" },
    { value: avgEngagementStr, label: "Avg Engagement", color: "#4ade80" },
  ];

  const avgScore = pastQuizzes.length > 0 
    ? Math.round(pastQuizzes.reduce((sum, q) => sum + q.score, 0) / pastQuizzes.length) 
    : 0;
  
  let averageGrade = "N/A";
  if (avgScore >= 90) averageGrade = "A";
  else if (avgScore >= 80) averageGrade = "B";
  else if (avgScore >= 70) averageGrade = "C";
  else if (avgScore >= 60) averageGrade = "D";
  else if (avgScore > 0) averageGrade = "F";

  const studentStats = [
    { value: studentClassrooms.length.toString(), label: "Active Courses", color: "#38bdf8" },
    { value: pastQuizzes.length.toString(), label: "Completed Quizzes", color: "#f59e0b" },
    { value: averageGrade, label: "Average Grade", color: "#4ade80" },
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
              <div className="flex items-center gap-3 mt-3">

                <button
                  onClick={() => setConfirmSignoutOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
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
                  <h3 className="text-base font-bold text-white">Recent Assessments Archive</h3>
                </div>
                <p className="text-sm text-on-surface-variant">Select a session to inspect student performance.</p>
              </div>

              <div className="flex h-[500px] flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {pastClassroomSessions.length === 0 ? (
                  <div className="text-sm text-on-surface-variant">No active classroom sessions found.</div>
                ) : pastClassroomSessions.map(mtg => {
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
              {studentClassrooms.length > 0 ? studentClassrooms.map(course => (
                <div key={course.id} className="group flex flex-col gap-5 rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-secondary/30">
                  <div>
                    <h4 className="text-base font-bold text-white">{course.name}</h4>
                    <p className="mt-0.5 text-xs text-on-surface-variant">Instructor: {course.teacherName}</p>
                  </div>
                  
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                      <span className="font-semibold">Avg Score</span>
                      <span className="font-bold">{avgScore}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${avgScore}%` }} />
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
                      {averageGrade}
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
        © 2026 EduAgent AI. All rights reserved. Developed by team <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#4ADE80]">Code Thrifters</span>
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
