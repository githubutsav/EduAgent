"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStudentClassrooms, joinClassroom, getStudentQuizzes, getStudentQuizResults, Classroom, Quiz, QuizResult, AppNotification, getUserNotifications, markNotificationsAsRead } from "../../lib/firestore";
import DashboardNav from "./DashboardNav";
import PageLoader from "./PageLoader";
import QuizReviewModal from "./QuizReviewModal";
import { toast } from "react-toastify";
import TakeQuizModal from "./TakeQuizModal";
import { School, Key, History, Flame, CheckCircle, TrendingUp, Calendar, Sparkles, Bell, BookOpen, ChevronRight, Settings2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggableWidget from "./DraggableWidget";
import FloatingChatbot from "./FloatingChatbot";
import ClassHistoryModal from "./ClassHistoryModal";
import { useAppStore } from "../store/useAppStore";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { studentData, isHydrating, refreshData } = useAppStore();
  const { classrooms, upcomingQuizzes, pastQuizzes } = studentData;

  const [joinRoomId, setJoinRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);

  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);
  const [historyClassroom, setHistoryClassroom] = useState<Classroom | null>(null);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['metrics', 'classes', 'performance', 'upcoming', 'history']);

  const DEFAULT_SIZES = {
    metrics: 3,
    classes: 2,
    performance: 1,
    upcoming: 2,
    history: 1,
  };
  const [widgetSizes, setWidgetSizes] = useState<Record<string, number>>(DEFAULT_SIZES);

  useEffect(() => {
    const saved = localStorage.getItem('studentLayout');
    if (saved) setWidgetOrder(JSON.parse(saved));
    const savedSizes = localStorage.getItem('studentWidgetSizes');
    if (savedSizes) setWidgetSizes(JSON.parse(savedSizes));
  }, []);

  useEffect(() => {
    if (widgetOrder.length > 0) {
      localStorage.setItem('studentLayout', JSON.stringify(widgetOrder));
    }
  }, [widgetOrder]);

  useEffect(() => {
    if (Object.keys(widgetSizes).length > 0) {
      localStorage.setItem('studentWidgetSizes', JSON.stringify(widgetSizes));
    }
  }, [widgetSizes]);

  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        const notifs = await getUserNotifications(user.uid);
        setNotifications(notifs);
      };
      fetchNotifs();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markNotificationsAsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleResize = (id: string, delta: number) => {
    setWidgetSizes(prev => {
      const current = prev[id] || DEFAULT_SIZES[id as keyof typeof DEFAULT_SIZES] || 1;
      const next = Math.max(1, Math.min(3, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);



  const pendingQuizzes = upcomingQuizzes.filter(
    (q) => !pastQuizzes.some((pq) => pq.quizId === q.id)
  );

  const handleJoinClassroom = async () => {
    if (!joinRoomId.trim() || !user) return;
    setIsJoining(true);
    try {
      await joinClassroom(joinRoomId, user.uid);
      router.push(`/classroom/${joinRoomId.trim().toLowerCase()}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading || !user || isHydrating) return <PageLoader message="Loading your dashboard..." />;

  const completedCount = pastQuizzes.length;
  const avgScore = pastQuizzes.length > 0 
    ? Math.round(pastQuizzes.reduce((sum, q) => sum + q.score, 0) / pastQuizzes.length) 
    : 0;

  // Calculate Streak based on consecutive days of quizzes
  const today = new Date().setHours(0,0,0,0);
  let currentStreak = 0;
  let bestStreak = 0;
  if (pastQuizzes.length > 0) {
    const dates = pastQuizzes.map(q => new Date(q.createdAt).setHours(0,0,0,0)).sort((a,b) => b - a);
    const uniqueDates = Array.from(new Set(dates));
    
    // Simplistic streak calculation: if most recent quiz was today or yesterday
    if (uniqueDates.length > 0 && (today - uniqueDates[0]) <= 86400000) {
      currentStreak = 1;
      let checkDate = uniqueDates[0];
      for (let i = 1; i < uniqueDates.length; i++) {
        if (checkDate - uniqueDates[i] === 86400000) {
          currentStreak++;
          checkDate = uniqueDates[i];
        } else {
          break;
        }
      }
    }
    // Best streak is just an estimation for now based on max consecutive
    bestStreak = Math.max(currentStreak, Math.min(uniqueDates.length, 5)); // Dummy calculation for best
  }

  // Calculate Attendance (Completion Ratio)
  const totalAssigned = completedCount + upcomingQuizzes.length;
  const attendanceRatio = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 100;

  const chartData = pastQuizzes.slice().reverse().map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: q.score,
    title: q.title
  }));

  const renderWidget = (id: string) => {
    switch (id) {
      case 'metrics':
        return (
          <DraggableWidget 
            id="metrics" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('metrics', delta)}
            currentSpan={widgetSizes['metrics'] || DEFAULT_SIZES['metrics']}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 h-full">
              <div className="rounded-xl border border-white/5 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Learning Streak</span>
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{currentStreak} Days</span>
                </div>
                <div className="mt-1 text-xs text-on-surface-variant/70">Personal Best: {bestStreak} Days</div>
              </div>
              
              <div className="rounded-xl border border-white/5 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Completed Quizzes</span>
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{completedCount}</span>
                </div>
                <div className="mt-1 text-xs text-on-surface-variant/70">Total quizzes taken</div>
              </div>

              <div className="rounded-xl border border-white/5 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Avg Score</span>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{avgScore}%</span>
                </div>
                <div className="mt-1 text-xs text-on-surface-variant/70">Across all quizzes</div>
              </div>

              <div className="rounded-xl border border-white/5 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Attendance</span>
                  <Calendar className="h-5 w-5 text-sky-400" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{attendanceRatio}%</span>
                </div>
                <div className="mt-1 text-xs text-on-surface-variant/70">Assignments Completed</div>
              </div>
            </div>
          </DraggableWidget>
        );
      case 'classes':
        return (
          <DraggableWidget 
            id="classes" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('classes', delta)}
            currentSpan={widgetSizes['classes'] || DEFAULT_SIZES['classes']}
          >
            <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/10 border border-sky-400/20">
                    <School className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">My Enrolled Classes</h2>
                    <p className="text-sm text-on-surface-variant">Your active live classrooms.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Room Code"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      className="w-full min-w-[180px] rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
                    />
                  </div>
                  <button 
                    onClick={handleJoinClassroom} 
                    disabled={isJoining || !joinRoomId.trim()} 
                    className="flex items-center justify-center rounded-lg bg-gradient-to-r from-primary-container to-secondary px-4 py-2 text-sm font-bold text-background-deep transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>

              {classrooms.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {classrooms.map(c => (
                    <div key={c.id} className="group shrink-0 w-[280px] sm:w-[320px] snap-start relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-background p-5 transition-all hover:border-sky-400/30 hover:bg-white/5">
                      <div>
                        <h3 className="text-base font-semibold text-white">{c.name}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">Teacher: <span className="text-white">{c.teacherName}</span></p>
                      </div>
                      <div className="mt-6 flex gap-2.5">
                        <button 
                          onClick={() => router.push(`/classroom/${c.roomCode}`)} 
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-sky-400/10 py-2.5 text-xs sm:text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-400/20"
                        >
                          Enter Live
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setHistoryClassroom(c)} 
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                          <History className="h-3.5 w-3.5 text-orange-400" />
                          History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-background/50 p-6 text-sm text-on-surface-variant">
                  You haven't enrolled in any classrooms yet. Use a code to join!
                </div>
              )}
            </div>
          </DraggableWidget>
        );
      case 'performance':
        return (
          <DraggableWidget 
            id="performance" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('performance', delta)}
            currentSpan={widgetSizes['performance'] || DEFAULT_SIZES['performance']}
          >
            <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Performance</h2>
                  <p className="text-sm text-on-surface-variant">Recent quiz scores.</p>
                </div>
              </div>
              
              <div className="min-h-[220px] flex-1 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#121318', borderColor: '#ffffff20', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#4ade80' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#4ade80" strokeWidth={3} dot={{ r: 4, fill: '#4ade80' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-on-surface-variant">
                    No data yet
                  </div>
                )}
              </div>
            </div>
          </DraggableWidget>
        );
      case 'upcoming':
        return (
          <DraggableWidget 
            id="upcoming" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('upcoming', delta)}
            currentSpan={widgetSizes['upcoming'] || DEFAULT_SIZES['upcoming']}
          >
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white">Upcoming Assignments</h2>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {pendingQuizzes.length > 0 ? pendingQuizzes.map((quiz, i) => (
                  <div key={quiz.id || i} className="flex items-center justify-between rounded-xl border border-white/5 bg-background p-4 transition-colors hover:bg-white/5">
                    <div>
                      <h4 className="font-semibold text-white">{quiz.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">{quiz.questions.length} Questions • Added {quiz.createdAt?.toDate ? quiz.createdAt.toDate().toLocaleDateString() : 'Recently'}</p>
                    </div>
                    <button 
                      onClick={() => setTakingQuiz(quiz)}
                      className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      Start
                    </button>
                  </div>
                )) : (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-on-surface-variant p-6">
                    All caught up!
                  </div>
                )}
              </div>
            </div>
          </DraggableWidget>
        );
      case 'history':
        return (
          <DraggableWidget 
            id="history" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('history', delta)}
            currentSpan={widgetSizes['history'] || DEFAULT_SIZES['history']}
          >
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-orange-400" />
                <h2 className="text-lg font-bold text-white">Quiz History</h2>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {pastQuizzes.length > 0 ? pastQuizzes.map((quiz, i) => (
                  <div key={quiz.id || i} className="flex items-center justify-between rounded-xl border border-white/5 bg-background p-4 transition-colors hover:bg-white/5">
                    <div>
                      <h4 className="font-semibold text-white">{quiz.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {quiz.createdAt?.toDate ? quiz.createdAt.toDate().toLocaleDateString() : 'Recently'} • <span className={quiz.score >= 70 ? "text-emerald-400" : "text-red-400"}>Score: {quiz.score}%</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedQuiz(quiz)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-tertiary" />
                      Analyze
                    </button>
                  </div>
                )) : (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-on-surface-variant p-6">
                    No history yet.
                  </div>
                )}
              </div>
            </div>
          </DraggableWidget>
        );
      default: return null;
    }
  };

  const getColSpan = (id: string) => {
    const span = widgetSizes[id] || DEFAULT_SIZES[id as keyof typeof DEFAULT_SIZES] || 1;
    if (span === 3) return 'lg:col-span-3';
    if (span === 2) return 'lg:col-span-2';
    return 'lg:col-span-1';
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-deep text-on-surface">
      <DashboardNav />

      <QuizReviewModal 
        isOpen={!!selectedQuiz} 
        onClose={() => setSelectedQuiz(null)} 
        quiz={selectedQuiz} 
      />

      <TakeQuizModal
        isOpen={!!takingQuiz}
        onClose={() => setTakingQuiz(null)}
        quiz={takingQuiz}
        onQuizSubmitted={refreshData}
      />

      <ClassHistoryModal 
        isOpen={!!historyClassroom} 
        onClose={() => setHistoryClassroom(null)} 
        classroom={historyClassroom} 
      />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-6 lg:p-8 relative">
        
        {/* Banner */}
        <div className="relative z-50 flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center">
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-400">
                Student Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary">{user.displayName ? user.displayName.split(" ")[0] : "Student"}</span>!
            </h1>
            <p className="mt-2 text-on-surface-variant">
              Ready to conquer today's lessons?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`group flex w-fit items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${isCustomizing ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(160,124,254,0.3)]' : 'border-white/10 bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white'}`}
            >
              <Settings2 className="h-4 w-4" />
              {isCustomizing ? "Done Customizing" : "Customize Layout"}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="group relative flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 focus:outline-none"
              >
                <Bell className="h-5 w-5 text-on-surface-variant group-hover:text-white transition-colors" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-surface/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <h3 className="font-bold text-white">Notifications</h3>
                    <span className="text-xs font-semibold text-primary cursor-pointer hover:underline" onClick={handleMarkAllRead}>Mark all as read</span>
                  </div>
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`flex flex-col gap-1 rounded-xl p-3 border ${n.read ? 'bg-white/5 border-white/5 opacity-70' : 'bg-primary/10 border-primary/20'}`}>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            {n.read ? null : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                            {n.title}
                          </p>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-on-surface-variant/50 mt-1">{n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-on-surface-variant text-center py-4">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Draggable Widgets Area */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div className={`grid grid-flow-row-dense grid-cols-1 gap-8 lg:grid-cols-3 transition-all ${isCustomizing ? 'p-4 rounded-3xl bg-white/5 border border-white/10 border-dashed' : ''}`}>
              {widgetOrder.map(id => (
                <div key={id} className={getColSpan(id)}>
                  {renderWidget(id)}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

      </main>

      <FloatingChatbot />

      <footer className="mt-auto border-t border-white/5 py-6 text-center text-xs text-on-surface-variant">
        © 2026 EduAgent AI. Secured workspace portal. Developed by team <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#4ADE80]">Code Thrifters</span>
      </footer>
    </div>
  );
}
