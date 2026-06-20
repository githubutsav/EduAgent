import { collection, doc, setDoc, getDoc, getDocs, query, where, arrayUnion, serverTimestamp, updateDoc, addDoc, orderBy } from "firebase/firestore";
import { db } from "../Firebaseconfig";

export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  roomCode: string;
  students: string[];
  createdAt: any;
}

export interface TranscriptLine {
  id?: string;
  text: string;
  speakerName: string;
  timestamp: any;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id?: string;
  roomId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: any;
}

export interface StudentAnswer {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id?: string;
  quizId: string;
  roomId: string;
  studentId: string;
  studentName: string;
  score: number;
  answers: StudentAnswer[];
  createdAt: any;
  // For UI joins
  title?: string;
}

/**
 * Generate a random 6-character alphanumeric room code
 */
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toLowerCase();
}

/**
 * Creates a new classroom in Firestore
 */
export async function createClassroom(name: string, description: string, teacherId: string, teacherName: string): Promise<Classroom> {
  if (!db) throw new Error("Firestore is not initialized.");

  let roomCode = generateRoomCode();
  let isUnique = false;

  while (!isUnique) {
    const q = query(collection(db, "classrooms"), where("roomCode", "==", roomCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    } else {
      roomCode = generateRoomCode();
    }
  }

  const newDocRef = doc(collection(db, "classrooms"));
  const classroomData = {
    id: newDocRef.id,
    name,
    description,
    teacherId,
    teacherName,
    roomCode,
    students: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(newDocRef, classroomData);
  return classroomData as Classroom;
}

/**
 * Allows a student to join a classroom using a room code
 */
export async function joinClassroom(roomCode: string, studentId: string): Promise<Classroom> {
  if (!db) throw new Error("Firestore is not initialized.");

  const q = query(collection(db, "classrooms"), where("roomCode", "==", roomCode.trim().toLowerCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Classroom not found. Please check the code and try again.");
  }

  const classDoc = snapshot.docs[0];
  const classData = classDoc.data() as Classroom;

  if (classData.students.includes(studentId)) {
    throw new Error("You are already enrolled in this classroom.");
  }

  await updateDoc(classDoc.ref, {
    students: arrayUnion(studentId)
  });

  return { ...classData, students: [...classData.students, studentId] };
}

/**
 * Fetch all classrooms hosted by a specific teacher
 */
export async function getTeacherClassrooms(teacherId: string): Promise<Classroom[]> {
  if (!db) return [];

  const q = query(collection(db, "classrooms"), where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as Classroom).sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Fetch all classrooms a specific student is enrolled in
 */
export async function getStudentClassrooms(studentId: string): Promise<Classroom[]> {
  if (!db) return [];

  const q = query(collection(db, "classrooms"), where("students", "array-contains", studentId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as Classroom);
}

/**
 * Saves a single line of transcribed text to the classroom's transcripts subcollection.
 */
export async function saveTranscriptLine(roomId: string, text: string, speakerName: string) {
  if (!db) return;
  const classQ = query(collection(db, "classrooms"), where("roomCode", "==", roomId));
  const classSnap = await getDocs(classQ);
  if (classSnap.empty) return;
  
  const classDocId = classSnap.docs[0].id;
  
  const transcriptsRef = collection(db, "classrooms", classDocId, "transcripts");
  await addDoc(transcriptsRef, {
    text,
    speakerName,
    timestamp: serverTimestamp()
  });
}

/**
 * Gets all transcripts for a room.
 */
export async function getRoomTranscripts(roomId: string): Promise<TranscriptLine[]> {
  if (!db) return [];
  const classQ = query(collection(db, "classrooms"), where("roomCode", "==", roomId));
  const classSnap = await getDocs(classQ);
  if (classSnap.empty) return [];
  
  const classDocId = classSnap.docs[0].id;
  const transcriptsRef = collection(db, "classrooms", classDocId, "transcripts");
  const q = query(transcriptsRef, orderBy("timestamp", "asc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as TranscriptLine);
}

/**
 * Saves an AI generated quiz to the classroom's quizzes subcollection.
 */
export async function saveGeneratedQuiz(roomId: string, title: string, questions: QuizQuestion[]) {
  if (!db) return;
  const classQ = query(collection(db, "classrooms"), where("roomCode", "==", roomId));
  const classSnap = await getDocs(classQ);
  if (classSnap.empty) return;
  
  const classDocId = classSnap.docs[0].id;
  const quizzesRef = collection(db, "classrooms", classDocId, "quizzes");
  
  await addDoc(quizzesRef, {
    roomId,
    title,
    questions,
    createdAt: serverTimestamp()
  });
}

/**
 * Fetches quizzes for a specific student across all their enrolled classes.
 */
export async function getStudentQuizzes(studentId: string): Promise<Quiz[]> {
  if (!db) return [];
  
  const classrooms = await getStudentClassrooms(studentId);
  if (classrooms.length === 0) return [];
  
  let allQuizzes: Quiz[] = [];
  for (const c of classrooms) {
    const quizzesRef = collection(db, "classrooms", c.id, "quizzes");
    const q = query(quizzesRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const quizzes = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        roomId: c.roomCode,
        title: `${c.name} - ${data.title}`,
        questions: data.questions,
        createdAt: data.createdAt
      } as Quiz;
    });
    allQuizzes = [...allQuizzes, ...quizzes];
  }
  
  return allQuizzes.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Saves a student's quiz submission
 */
export async function submitQuizResult(
  quizId: string, 
  roomId: string, 
  studentId: string, 
  studentName: string, 
  score: number, 
  answers: StudentAnswer[]
) {
  if (!db) return;
  const classQ = query(collection(db, "classrooms"), where("roomCode", "==", roomId));
  const classSnap = await getDocs(classQ);
  if (classSnap.empty) return;
  
  const classDocId = classSnap.docs[0].id;
  const resultsRef = collection(db, "classrooms", classDocId, "quizResults");
  
  await addDoc(resultsRef, {
    quizId,
    roomId,
    studentId,
    studentName,
    score,
    answers,
    createdAt: serverTimestamp()
  });
}

/**
 * Gets all completed quiz results for a specific student
 */
export async function getStudentQuizResults(studentId: string): Promise<QuizResult[]> {
  if (!db) return [];
  
  const classrooms = await getStudentClassrooms(studentId);
  if (classrooms.length === 0) return [];
  
  let allResults: QuizResult[] = [];
  for (const c of classrooms) {
    const resultsRef = collection(db, "classrooms", c.id, "quizResults");
    const q = query(resultsRef, where("studentId", "==", studentId));
    const snap = await getDocs(q);
    
    // We also need the quiz titles, let's fetch them
    const quizzesRef = collection(db, "classrooms", c.id, "quizzes");
    const quizzesSnap = await getDocs(quizzesRef);
    const quizMap = new Map();
    quizzesSnap.docs.forEach(doc => {
      quizMap.set(doc.id, doc.data().title);
    });

    const results = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        title: `${c.name} - ${quizMap.get(data.quizId) || 'Quiz'}`,
      } as QuizResult;
    });
    allResults = [...allResults, ...results];
  }
  
  return allResults.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Gets aggregated analytics for all students in a teacher's classrooms
 */
export async function getTeacherStudentsAnalytics(teacherId: string) {
  if (!db) return [];
  
  // 1. Get all classrooms for this teacher
  const classrooms = await getTeacherClassrooms(teacherId);
  if (classrooms.length === 0) return [];

  // Map to hold student analytics: key = studentId
  const studentStats = new Map<string, { 
    studentId: string,
    name: string, 
    totalScore: number, 
    quizCount: number, 
    avatarSeed: string 
  }>();

  // 2. Aggregate quiz results across all these classrooms
  for (const c of classrooms) {
    const classDocId = c.id;
    const resultsRef = collection(db, "classrooms", classDocId, "quizResults");
    const snap = await getDocs(resultsRef);
    
    snap.docs.forEach(doc => {
      const data = doc.data();
      const sId = data.studentId;
      if (!studentStats.has(sId)) {
        studentStats.set(sId, { 
          studentId: sId,
          name: data.studentName || 'Student', 
          totalScore: 0, 
          quizCount: 0, 
          avatarSeed: data.studentName || sId 
        });
      }
      const stat = studentStats.get(sId)!;
      stat.totalScore += data.score;
      stat.quizCount += 1;
    });
  }

  // 3. Format into the structure the UI expects
  const analytics = Array.from(studentStats.values()).map(stat => {
    const avgScore = stat.quizCount > 0 ? Math.round(stat.totalScore / stat.quizCount) : 0;
    let status: "Exceling" | "On Track" | "Needs Focus" = "On Track";
    let statusColor = "#60a5fa"; // blue
    
    if (avgScore >= 90) {
      status = "Exceling";
      statusColor = "#4ade80"; // green
    } else if (avgScore < 70) {
      status = "Needs Focus";
      statusColor = "#f87171"; // red
    }

    return {
      studentId: stat.studentId,
      name: stat.name,
      avatarSeed: stat.avatarSeed,
      progress: avgScore,
      engagement: `${Math.min(100, 70 + (stat.quizCount * 5))}%`,
      status,
      statusColor
    };
  });

  return analytics;
}
