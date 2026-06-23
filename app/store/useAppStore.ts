import { create } from 'zustand';
import { Classroom, Quiz, QuizResult, getStudentClassrooms, getStudentQuizzes, getStudentQuizResults, getTeacherClassrooms, getTeacherStudentsAnalytics } from '../../lib/firestore';

interface UserProfileDetails {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: "teacher" | "student";
  isMock?: boolean;
  // Progressive profiling fields
  bio?: string;
  gradeLevel?: string;
  subjectsTaught?: string;
  school?: string;
  hasCompletedOnboarding?: boolean;
}

interface StudentData {
  classrooms: Classroom[];
  upcomingQuizzes: Quiz[];
  pastQuizzes: QuizResult[];
}

interface TeacherData {
  classrooms: Classroom[];
  studentAnalytics: any[];
}

interface AppState {
  userProfile: UserProfileDetails | null;
  studentData: StudentData;
  teacherData: TeacherData;
  isHydrating: boolean;
  
  setUserProfile: (profile: UserProfileDetails | null) => void;
  updateUserProfileFields: (fields: Partial<UserProfileDetails>) => void;
  fetchStudentData: (uid: string) => Promise<void>;
  fetchTeacherData: (uid: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  userProfile: null,
  studentData: {
    classrooms: [],
    upcomingQuizzes: [],
    pastQuizzes: []
  },
  teacherData: {
    classrooms: [],
    studentAnalytics: []
  },
  isHydrating: false,

  setUserProfile: (profile) => set({ userProfile: profile }),

  updateUserProfileFields: (fields) => set((state) => ({
    userProfile: state.userProfile ? { ...state.userProfile, ...fields } : null
  })),

  fetchStudentData: async (uid: string) => {
    try {
      set({ isHydrating: true });
      const [classrooms, upcomingQuizzes, pastQuizzes] = await Promise.all([
        getStudentClassrooms(uid),
        getStudentQuizzes(uid),
        getStudentQuizResults(uid)
      ]);
      set({ 
        studentData: { classrooms, upcomingQuizzes, pastQuizzes },
        isHydrating: false 
      });
    } catch (error) {
      console.error("Error fetching student data:", error);
      set({ isHydrating: false });
    }
  },

  fetchTeacherData: async (uid: string) => {
    try {
      set({ isHydrating: true });
      const [classrooms, studentAnalytics] = await Promise.all([
        getTeacherClassrooms(uid),
        getTeacherStudentsAnalytics(uid)
      ]);
      set({ 
        teacherData: { classrooms, studentAnalytics },
        isHydrating: false 
      });
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      set({ isHydrating: false });
    }
  },

  refreshData: async () => {
    const user = get().userProfile;
    if (!user) return;
    
    if (user.role === 'student') {
      await get().fetchStudentData(user.uid);
    } else {
      await get().fetchTeacherData(user.uid);
    }
  }
}));
