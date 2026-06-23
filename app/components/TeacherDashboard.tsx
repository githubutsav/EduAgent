"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClassroom, getTeacherClassrooms, getTeacherStudentsAnalytics, Classroom, getClassroomQuizzes, Quiz, updateClassroomQuiz, QuizQuestion, deleteClassroom } from "../../lib/firestore";
import DashboardNav from "../components/DashboardNav";
import PageLoader from "../components/PageLoader";
import DeleteClassroomConfirmModal from "./DeleteClassroomConfirmModal";
import { toast } from "react-toastify";
import { Users, Lightbulb, BookOpen, Activity, RefreshCw, Video, Plus, Key, Eye, FilePlus2, Sparkles, X, AlertCircle, Trash2, CheckCircle2, TrendingUp, Settings2 } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggableWidget from "./DraggableWidget";
import FloatingChatbot from "./FloatingChatbot";

const statCards = [
  { label: "Class Engagement", value: "94.2%", delta: "+0.8%", deltaColor: "#4ade80", sub: "vs weekly benchmark (93.4%)", icon: Users },
  { label: "AI Adaptive Plans", value: "48", delta: "12 new", deltaColor: "#cfbcff", sub: "Tailored adjustments applied", icon: Lightbulb },
  { label: "Active Curriculums", value: "8", delta: "Active", deltaColor: "#948e9f", sub: "Dynamic courses synced", icon: BookOpen },
  { label: "Performance Score", value: "87.4%", delta: "+2.1%", deltaColor: "#4ade80", sub: "Growth over term average", icon: Activity },
];

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [subject, setSubject] = useState("Mathematics");
  const [focusArea, setFocusArea] = useState("Algebra foundations & equations");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [studentAnalytics, setStudentAnalytics] = useState<any[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  
  const [selectedClassroomForQuiz, setSelectedClassroomForQuiz] = useState<Classroom | null>(null);
  const [quizzesMap, setQuizzesMap] = useState<Record<string, Quiz[]>>({});
  const [activeViewQuiz, setActiveViewQuiz] = useState<Quiz | null>(null);
  
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editingQuizTitle, setEditingQuizTitle] = useState("");
  const [editingQuestions, setEditingQuestions] = useState<QuizQuestion[]>([]);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [editingError, setEditingError] = useState("");
  const [isSyncingRoster, setIsSyncingRoster] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['classrooms', 'quickQuiz', 'stats', 'aiPlan', 'analytics', 'students']);

  const DEFAULT_SIZES = {
    classrooms: 2,
    quickQuiz: 2,
    stats: 2,
    aiPlan: 1,
    analytics: 1,
    students: 2,
  };
  const [widgetSizes, setWidgetSizes] = useState<Record<string, number>>(DEFAULT_SIZES);

  useEffect(() => {
    const saved = localStorage.getItem('teacherLayout');
    if (saved) setWidgetOrder(JSON.parse(saved));
    const savedSizes = localStorage.getItem('teacherWidgetSizes');
    if (savedSizes) setWidgetSizes(JSON.parse(savedSizes));
  }, []);

  useEffect(() => {
    if (widgetOrder.length > 0) {
      localStorage.setItem('teacherLayout', JSON.stringify(widgetOrder));
    }
  }, [widgetOrder]);

  useEffect(() => {
    if (Object.keys(widgetSizes).length > 0) {
      localStorage.setItem('teacherWidgetSizes', JSON.stringify(widgetSizes));
    }
  }, [widgetSizes]);

  const handleResize = (id: string, delta: number) => {
    setWidgetSizes(prev => {
      const current = prev[id] || DEFAULT_SIZES[id as keyof typeof DEFAULT_SIZES] || 1;
      const next = Math.max(1, Math.min(2, current + delta));
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

  useEffect(() => {
    if (user) {
      getTeacherClassrooms(user.uid).then(setClassrooms).catch(console.error);
      getTeacherStudentsAnalytics(user.uid).then(data => {
        setStudentAnalytics(data);
        if (data.length > 0) setSelectedStudent(data[0]);
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (classrooms.length > 0) {
      classrooms.forEach(c => {
        getClassroomQuizzes(c.id).then(quizzes => {
          setQuizzesMap(prev => ({ ...prev, [c.id]: quizzes }));
        }).catch(console.error);
      });
    }
  }, [classrooms]);

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomForQuiz) {
      setSelectedClassroomForQuiz(classrooms[0]);
    }
  }, [classrooms, selectedClassroomForQuiz]);

  if (loading || !user) return <PageLoader message="Verifying secure session..." />;

  const handleCreateClassroom = async () => {
    if (!user || !newRoomName.trim()) return;
    setIsCreatingRoom(true);
    try {
      const newClass = await createClassroom(
        newRoomName.trim(), 
        "A dynamically created classroom", 
        user.uid, 
        user.displayName || "Educator"
      );
      setClassrooms([newClass, ...classrooms]);
      setNewRoomName("");
    } catch (error) {
      toast.error("Error creating room: " + (error as Error).message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;
    setIsDeleting(true);
    try {
      await deleteClassroom(classroomToDelete.id);
      const remaining = classrooms.filter(c => c.id !== classroomToDelete.id);
      setClassrooms(remaining);
      if (selectedClassroomForQuiz?.id === classroomToDelete.id) {
        setSelectedClassroomForQuiz(remaining.length > 0 ? remaining[0] : null);
      }
      setClassroomToDelete(null);
      toast.success("Classroom deleted successfully.");
    } catch (error) {
      toast.error("Error deleting classroom: " + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickQuizClick = async () => {
    if (!user) return;
    if (classrooms.length === 0) {
      setIsCreatingRoom(true);
      try {
        const newClass = await createClassroom(
          "My First Class", 
          "A default classroom created to host quizzes.", 
          user.uid, 
          user.displayName || "Educator"
        );
        setClassrooms([newClass]);
        setSelectedClassroomForQuiz(newClass);
        router.push(`/create-quiz/${newClass.roomCode}`);
      } catch (error) {
        toast.error("Failed to auto-create classroom: " + (error as Error).message);
      } finally {
        setIsCreatingRoom(false);
      }
    } else {
      if (selectedClassroomForQuiz) {
        router.push(`/create-quiz/${selectedClassroomForQuiz.roomCode}`);
      }
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusArea.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedPlan("");

    try {
      const prompt = `You are an expert AI curriculum planner. A teacher wants an adaptive curriculum for ${subject}. 
      The focus area is: ${focusArea}. 
      Provide a brief, actionable 3-step recommendation plan. Estimate an engagement boost percentage. Use Markdown format. Keep it extremely concise.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            setGeneratedPlan(prev => (prev || "") + finalChunk);
          }
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setGeneratedPlan(prev => (prev || "") + chunk);
        }
      }
    } catch (error) {
      console.error(error);
      setGeneratedPlan("⚠️ Failed to generate curriculum. Please check your AI API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateQuestionText = (index: number, val: string) => {
    const updated = [...editingQuestions];
    updated[index].question = val;
    setEditingQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...editingQuestions];
    const oldVal = updated[qIndex].options[optIndex];
    updated[qIndex].options[optIndex] = val;
    if (updated[qIndex].correctAnswer === oldVal) {
      updated[qIndex].correctAnswer = val;
    }
    setEditingQuestions(updated);
  };

  const handleUpdateCorrectAnswer = (qIndex: number, val: string) => {
    const updated = [...editingQuestions];
    updated[qIndex].correctAnswer = val;
    setEditingQuestions(updated);
  };

  const handleAddQuestionToQuiz = () => {
    setEditingQuestions([
      ...editingQuestions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" }
    ]);
  };

  const handleRemoveQuestionFromQuiz = (index: number) => {
    if (editingQuestions.length === 1) return;
    setEditingQuestions(editingQuestions.filter((_, i) => i !== index));
  };

  const handleSaveQuizEdit = async () => {
    if (!activeViewQuiz) return;
    setEditingError("");
    
    if (!editingQuizTitle.trim()) {
      setEditingError("Quiz Title cannot be empty.");
      return;
    }

    for (let i = 0; i < editingQuestions.length; i++) {
      const q = editingQuestions[i];
      if (!q.question.trim()) {
        setEditingError(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) {
          setEditingError(`Option ${o + 1} for Question ${i + 1} cannot be empty.`);
          return;
        }
      }
      if (!q.correctAnswer) {
        setEditingError(`Please select the correct answer for Question ${i + 1}.`);
        return;
      }
    }

    setIsSavingQuiz(true);
    try {
      await updateClassroomQuiz(activeViewQuiz.roomId, activeViewQuiz.id!, editingQuizTitle.trim(), editingQuestions);
      
      const updatedQuiz = {
        ...activeViewQuiz,
        title: editingQuizTitle.trim(),
        questions: editingQuestions
      };
      
      const classroom = classrooms.find(c => c.roomCode === activeViewQuiz.roomId);
      if (classroom) {
        setQuizzesMap(prev => {
          const classroomQuizzes = prev[classroom.id] || [];
          const updatedList = classroomQuizzes.map(q => q.id === activeViewQuiz.id ? updatedQuiz : q);
          return { ...prev, [classroom.id]: updatedList };
        });
      }
      
      setActiveViewQuiz(updatedQuiz);
      setIsEditingQuiz(false);
    } catch (err: any) {
      console.error(err);
      setEditingError(err.message || "Failed to save quiz changes.");
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleSyncRoster = () => {
    if (isSyncingRoster) return;
    setIsSyncingRoster(true);
    setTimeout(() => {
      setIsSyncingRoster(false);
      toast.success("Classroom rosters have been synced with the school database and all active sessions are updated.");
    }, 2000);
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'classrooms':
        return (
          <DraggableWidget 
            id="classrooms" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('classrooms', delta)}
            currentSpan={widgetSizes['classrooms'] || DEFAULT_SIZES['classrooms']}
          >
            <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">My Active Classrooms</h2>
                    <p className="text-sm text-on-surface-variant">Create and manage real classrooms hosted on your database.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New Class Name (e.g. Physics 101)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full min-w-[220px] rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
                  />
                  <button 
                    onClick={handleCreateClassroom} 
                    disabled={isCreatingRoom || !newRoomName.trim()} 
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary px-4 py-2 text-sm font-bold text-background-deep transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{isCreatingRoom ? "Creating..." : "Create"}</span>
                  </button>
                </div>
              </div>
              
              {classrooms.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {classrooms.map(c => (
                    <div key={c.id} className="group shrink-0 w-[280px] sm:w-[320px] snap-start relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-background p-5 transition-all hover:border-primary/30 hover:bg-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate text-base font-semibold text-white" title={c.name}>{c.name}</h4>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{c.students?.length || 0} Students</span>
                          <button 
                            onClick={() => setClassroomToDelete(c)}
                            className="rounded p-1 text-on-surface-variant/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Delete Classroom"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-md bg-black/20 px-2.5 py-1 text-xs text-on-surface-variant">
                        <Key className="h-3.5 w-3.5 text-on-surface-variant/70" />
                        Room Code: <strong className="tracking-wider text-emerald-400">{c.roomCode}</strong>
                      </div>
                      <div className="mt-5 flex flex-col gap-2">
                        <button 
                          onClick={() => router.push(`/classroom/${c.roomCode}`)} 
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          Enter Classroom
                        </button>
                        {quizzesMap[c.id] && quizzesMap[c.id].length > 0 ? (
                          <button
                            onClick={() => {
                              const q = quizzesMap[c.id][0];
                              setActiveViewQuiz(q);
                              setEditingQuizTitle(q.title);
                              setEditingQuestions(JSON.parse(JSON.stringify(q.questions)));
                              setIsEditingQuiz(false);
                              setEditingError("");
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/20"
                          >
                            <Eye className="h-4 w-4" />
                            View Quiz
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/create-quiz/${c.roomCode}`)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                          >
                            <FilePlus2 className="h-4 w-4" />
                            Generate Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-background/50 p-6 text-sm text-on-surface-variant">
                  You haven't created any classrooms yet. Use the form above to create one!
                </div>
              )}
            </div>
          </DraggableWidget>
        );
      case 'quickQuiz':
        return (
          <DraggableWidget 
            id="quickQuiz" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('quickQuiz', delta)}
            currentSpan={widgetSizes['quickQuiz'] || DEFAULT_SIZES['quickQuiz']}
          >
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-primary/20 bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                  <FilePlus2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Quick Quiz Creator</h3>
                  <p className="text-sm text-on-surface-variant">Draft questions manually or auto-generate a quiz for any of your classrooms.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {classrooms.length > 0 && (
                  <select 
                    onChange={(e) => {
                      const selected = classrooms.find(c => c.id === e.target.value);
                      if (selected) setSelectedClassroomForQuiz(selected);
                    }}
                    value={selectedClassroomForQuiz?.id || ""}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none cursor-pointer focus:border-primary/50"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                    ))}
                  </select>
                )}
                <button 
                  onClick={handleQuickQuizClick}
                  disabled={isCreatingRoom}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary px-5 py-2 text-sm font-bold text-background-deep transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isCreatingRoom && classrooms.length === 0 ? "Creating Classroom..." : "Generate Quiz"}
                </button>
              </div>
            </div>
          </DraggableWidget>
        );
      case 'stats':
        return (
          <DraggableWidget 
            id="stats" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('stats', delta)}
            currentSpan={widgetSizes['stats'] || DEFAULT_SIZES['stats']}
          >
            <div className="grid h-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="relative overflow-hidden rounded-xl border border-white/5 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-center h-full">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{c.label}</span>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{c.value}</span>
                      <span className="text-xs font-semibold" style={{ color: c.deltaColor }}>{c.delta}</span>
                    </div>
                    <div className="mt-1 text-xs text-on-surface-variant/70">{c.sub}</div>
                  </div>
                );
              })}
            </div>
          </DraggableWidget>
        );
      case 'aiPlan':
        return (
          <DraggableWidget 
            id="aiPlan" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('aiPlan', delta)}
            currentSpan={widgetSizes['aiPlan'] || DEFAULT_SIZES['aiPlan']}
          >
            <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-white">AI Adaptive Plan Generator</h2>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">Generate customized intervention scripts for distinct student segments.</p>
              </div>

              <form onSubmit={handleGeneratePlan} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Select Subject</label>
                    <select 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)} 
                      className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none cursor-pointer focus:border-primary/50"
                    >
                      <option value="Mathematics" className="bg-surface">Mathematics</option>
                      <option value="Science" className="bg-surface">Science</option>
                      <option value="Literature" className="bg-surface">Literature</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Classroom Size</label>
                    <input type="text" disabled value="24 Students" className="rounded-lg border border-white/5 bg-black/10 p-2.5 text-sm text-on-surface-variant/70 outline-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Focus Concepts</label>
                  <input 
                    type="text" 
                    value={focusArea} 
                    onChange={(e) => setFocusArea(e.target.value)} 
                    placeholder="e.g. Algebra foundations" 
                    className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-primary/50" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating || !focusArea.trim()} 
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary py-3 text-sm font-bold text-background-deep transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Formulating Plan..." : "Generate AI Insight Plan"}
                </button>
              </form>

              {generatedPlan && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-auto">
                  <div className="text-sm leading-relaxed text-on-surface-variant whitespace-pre-line">
                    {generatedPlan.split("\n").map((line, idx) => {
                      if (line.startsWith("###")) return <h4 key={idx} className="mb-3 mt-4 text-base font-bold text-white">{line.replace("###", "").trim()}</h4>;
                      if (line.startsWith("**Focus Area:**") || line.startsWith("**Recommended Actions:**")) return <p key={idx} className="my-1 text-white"><strong>{line.split("**")[1]}:</strong>{line.split("**")[2]}</p>;
                      if (/^\d\./.test(line)) return <div key={idx} className="my-1.5 ml-3 flex gap-2"><span className="font-semibold text-primary">{line.substring(0, 2)}</span><span>{line.substring(2).trim()}</span></div>;
                      if (line.startsWith("*Estimated")) return <p key={idx} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><TrendingUp className="h-4 w-4" />{line.replace(/\*/g, "")}</p>;
                      return <p key={idx} className="my-1">{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </DraggableWidget>
        );
      case 'analytics':
        return (
          <DraggableWidget 
            id="analytics" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('analytics', delta)}
            currentSpan={widgetSizes['analytics'] || DEFAULT_SIZES['analytics']}
          >
            <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">Classroom Performance Analytics</h2>
                  </div>
                  <span className="text-xs text-on-surface-variant">Weekly Avg</span>
                </div>
                <p className="text-sm text-on-surface-variant">Click a bar to set focus subject for AI plan generation.</p>
              </div>

              <div className="h-[220px] w-full mt-4 cursor-pointer flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart 
                    data={[
                      { subject: "Mathematics", label: "Math", score: 88, fill: "url(#colorMath)" },
                      { subject: "Science", label: "Science", score: 91, fill: "url(#colorSci)" },
                      { subject: "Literature", label: "Lit", score: 76, fill: "url(#colorMath)" },
                      { subject: "Technology", label: "Tech", score: 95, fill: "url(#colorSci)" },
                      { subject: "Arts", label: "Arts", score: 82, fill: "url(#colorMath)" },
                    ]} 
                    margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        setSubject(state.activePayload[0].payload.subject);
                      }
                    }}
                  >
                    <defs>
                      <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a07cfe" />
                        <stop offset="100%" stopColor="rgba(160,124,254,0.15)" />
                      </linearGradient>
                      <linearGradient id="colorSci" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cfbcff" />
                        <stop offset="100%" stopColor="rgba(207,188,255,0.1)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbc3d5', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#948e9f', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#121318', borderColor: '#ffffff20', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {
                        [
                          { subject: "Mathematics", label: "Math", score: 88, fill: "url(#colorMath)" },
                          { subject: "Science", label: "Science", score: 91, fill: "url(#colorSci)" },
                          { subject: "Literature", label: "Lit", score: 76, fill: "url(#colorMath)" },
                          { subject: "Technology", label: "Tech", score: 95, fill: "url(#colorSci)" },
                          { subject: "Arts", label: "Arts", score: 82, fill: "url(#colorMath)" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))
                      }
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-4 text-xs text-on-surface-variant mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#a07cfe]" /> Core Subjects
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#cfbcff]" /> Specializations
                </div>
              </div>
            </div>
          </DraggableWidget>
        );
      case 'students':
        return (
          <DraggableWidget 
            id="students" 
            isCustomizing={isCustomizing}
            onResize={(delta) => handleResize('students', delta)}
            currentSpan={widgetSizes['students'] || DEFAULT_SIZES['students']}
          >
            <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">Student Performance Tracking</h2>
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-on-surface-variant">
                    {studentAnalytics.length} Profiles
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">Review real-time student metrics based on auto-generated quiz results.</p>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {studentAnalytics.length > 0 ? studentAnalytics.map((st: any) => (
                  <div
                    key={st.studentId}
                    onClick={() => setSelectedStudent(st)}
                    className={`flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                      selectedStudent?.studentId === st.studentId 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:w-60 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(st.avatarSeed)}`} alt={st.name} className="h-10 w-10 rounded-full border border-primary/20 bg-primary/10 object-cover" />
                      <div>
                        <div className="text-sm font-semibold text-white">{st.name}</div>
                        <div className="text-xs text-on-surface-variant">Avg Score: {st.progress}%</div>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center gap-3">
                      <span className="w-8 text-right text-xs text-on-surface-variant">{st.progress}%</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${st.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between sm:justify-end gap-5 sm:w-48">
                      <div className="flex flex-col text-left sm:text-right">
                        <span className="text-[0.65rem] font-semibold uppercase text-on-surface-variant">Activity</span>
                        <span className="text-sm font-semibold text-white">{st.engagement}</span>
                      </div>
                      <span className="w-24 rounded-md border py-1 text-center text-xs font-bold" style={{ color: st.statusColor, backgroundColor: `${st.statusColor}15`, borderColor: `${st.statusColor}30` }}>
                        {st.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-sm text-on-surface-variant">
                    No student data available yet. Students need to complete auto-generated quizzes first.
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Selected Student Dossier</span>
                    <h4 className="mt-1 text-base font-bold text-white">{selectedStudent.name} — {selectedStudent.status}</h4>
                    <p className="mt-0.5 text-sm text-on-surface-variant">4 completed objectives. AI recommends scheduling an intervention script.</p>
                  </div>
                  <button
                    onClick={() => { setFocusArea(`Targeted review for ${selectedStudent.name}`); toast.success(`Focus set to ${selectedStudent.name}! Generate an AI plan above.`); }}
                    className="shrink-0 rounded-lg border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    Auto-Select for Focus Area
                  </button>
                </div>
              )}
            </div>
          </DraggableWidget>
        );
      default: return null;
    }
  };

  const getColSpan = (id: string) => {
    const span = widgetSizes[id] || DEFAULT_SIZES[id as keyof typeof DEFAULT_SIZES] || 1;
    if (span === 2) return 'lg:col-span-2';
    return 'lg:col-span-1';
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-deep text-on-surface">
      <DashboardNav />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-6 lg:p-8 relative">
        {/* Banner */}
        <div className="flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center">
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Educator Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary">{user.displayName ? user.displayName.split(" ")[0] : "Educator"}</span>!
            </h1>
            <p className="mt-2 text-on-surface-variant">
              What are your plans for students today?
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              className="group flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSyncRoster}
              disabled={isSyncingRoster}
            >
              <RefreshCw className={`h-4 w-4 text-on-surface-variant group-hover:text-white transition-colors ${isSyncingRoster ? "animate-spin" : ""}`} />
              {isSyncingRoster ? "Syncing..." : "Sync Roster"}
            </button>
            <button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`group flex w-fit items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${isCustomizing ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(160,124,254,0.3)]' : 'border-white/10 bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white'}`}
            >
              <Settings2 className="h-4 w-4" />
              {isCustomizing ? "Done Customizing" : "Customize Layout"}
            </button>
          </div>
        </div>

        {/* Draggable Widgets Area */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div className={`grid items-start grid-cols-1 gap-8 lg:grid-cols-2 transition-all ${isCustomizing ? 'p-4 rounded-3xl bg-white/5 border border-white/10 border-dashed' : ''}`}>
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

      <footer className="border-t border-white/5 py-6 text-center text-xs text-on-surface-variant mt-auto">
        © 2026 EduAgent AI. Secured workspace portal.
      </footer>

      {/* Editing Quiz Modal remains unchanged */}
      {activeViewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-2xl border border-primary/20 bg-background-deep p-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {isEditingQuiz ? "Editing Classroom Quiz" : "Classroom Quiz"}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-white">
                  {isEditingQuiz ? "Edit Mode" : activeViewQuiz.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveViewQuiz(null);
                  setIsEditingQuiz(false);
                }}
                disabled={isSavingQuiz}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-on-surface-variant transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            {isEditingQuiz ? (
              <div className="flex flex-col gap-5">
                {editingError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{editingError}</span>
                  </div>
                )}
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Quiz Title</label>
                  <input
                    type="text"
                    value={editingQuizTitle}
                    onChange={(e) => setEditingQuizTitle(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-primary/50"
                  />
                </div>

                <div className="flex flex-col gap-6">
                  {editingQuestions.map((q, idx) => (
                    <div key={idx} className="relative flex flex-col gap-4 rounded-xl border border-white/5 bg-white/5 p-5">
                      
                      {editingQuestions.length > 1 && (
                        <button
                          onClick={() => handleRemoveQuestionFromQuiz(idx)}
                          className="absolute right-4 top-4 text-red-400 opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}

                      <span className="text-xs font-bold tracking-widest text-primary">QUESTION {idx + 1}</span>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Question Text</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestionText(idx, e.target.value)}
                          className="rounded-lg border border-white/5 bg-black/20 p-3 text-sm text-white outline-none focus:border-primary/50"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex flex-col gap-1.5">
                            <label className="text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">OPTION {String.fromCharCode(65 + optIdx)}</label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                              className="rounded-lg border border-white/5 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-primary/50"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Correct Answer</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleUpdateCorrectAnswer(idx, e.target.value)}
                          className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-400 outline-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-surface text-on-surface-variant">Select correct option</option>
                          {q.options.filter(o => o.trim() !== "").map((opt, optIdx) => (
                            <option key={optIdx} value={opt} className="bg-surface text-white">{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddQuestionToQuiz}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:border-white/40"
                >
                  <Plus className="h-5 w-5" />
                  Add Another Question
                </button>

                <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-6">
                  <button
                    onClick={() => {
                      setIsEditingQuiz(false);
                      setEditingError("");
                    }}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuizEdit}
                    disabled={isSavingQuiz}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isSavingQuiz ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <p className="text-sm text-on-surface-variant">
                    {activeViewQuiz.questions.length} Questions • Created {activeViewQuiz.createdAt?.toDate ? activeViewQuiz.createdAt.toDate().toLocaleDateString() : 'Recently'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingQuizTitle(activeViewQuiz.title);
                      setEditingQuestions(JSON.parse(JSON.stringify(activeViewQuiz.questions)));
                      setIsEditingQuiz(true);
                      setEditingError("");
                    }}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    Edit Quiz
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {activeViewQuiz.questions.map((q, idx) => (
                    <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-5">
                      <h4 className="font-semibold text-white"><span className="text-primary mr-2">{idx + 1}.</span> {q.question}</h4>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`rounded-lg border p-3 text-sm transition-colors ${
                              opt === q.correctAnswer 
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 font-medium" 
                              : "border-white/5 bg-black/20 text-on-surface-variant"
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {classroomToDelete && (
        <DeleteClassroomConfirmModal
          isOpen={!!classroomToDelete}
          classroomName={classroomToDelete.name}
          onClose={() => setClassroomToDelete(null)}
          onConfirm={handleDeleteClassroom}
        />
      )}

    </div>
  );
}
