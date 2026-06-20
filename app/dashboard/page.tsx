"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import PageLoader from "../components/PageLoader";
import TeacherDashboard from "../components/TeacherDashboard";
import StudentDashboard from "../components/StudentDashboard";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <PageLoader message="Verifying secure session..." />;
  }

  // Route to specific dashboard based on role
  if (user.role === "student") {
    return <StudentDashboard />;
  }

  // Default to teacher dashboard if role is 'teacher' or not set (for legacy accounts)
  return <TeacherDashboard />;
}
