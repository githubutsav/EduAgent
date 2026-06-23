import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { updateUserProfile } from '../../lib/firestore';
import { Sparkles, ArrowRight, BookOpen, School, Target } from 'lucide-react';
import { toast } from 'react-toastify';

export default function OnboardingWizard() {
  const { userProfile, setUserProfile, updateUserProfileFields } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    gradeLevel: '',
    subjectsTaught: '',
    bio: ''
  });

  useEffect(() => {
    // Only show if user is logged in, not a mock user (or handle mock user as well),
    // and hasn't completed onboarding.
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      setIsOpen(true);
    }
  }, [userProfile]);

  if (!isOpen || !userProfile) return null;

  const isStudent = userProfile.role === 'student';

  const studentGrades = ["Middle School", "High School", "College/University", "Self-Taught", "Other"];
  const teacherSubjects = ["Mathematics", "Science", "Literature & English", "History & Humanities", "Computer Science", "Multiple Subjects"];
  
  const studentGoals = ["Improve my grades", "Prepare for standardized tests", "Learn a new skill or language", "Get help with homework"];
  const teacherGoals = ["Manage my classrooms", "Track student progress", "Create interactive quizzes", "Automate grading and analytics"];

  const handleNext = async () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      // Finish onboarding
      try {
        const updateFields = {
          ...formData,
          hasCompletedOnboarding: true
        };
        
        if (!userProfile.isMock) {
          await updateUserProfile(userProfile.uid, updateFields);
        }
        
        updateUserProfileFields(updateFields);
        setIsOpen(false);
        toast.success("Profile personalized successfully! Welcome to your dashboard.");
      } catch (e) {
        toast.error("Failed to save profile. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-deep/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl">
        <div className="absolute top-0 h-1 w-full bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Let's personalize!</h2>
              <p className="text-sm text-on-surface-variant">Step {step + 1} of 2</p>
            </div>
          </div>

          <div className="min-h-[160px]">
            {step === 0 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                <p className="text-sm text-on-surface-variant">
                  {isStudent ? "What grade are you currently in?" : "What subjects do you specialize in?"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(isStudent ? studentGrades : teacherSubjects).map(option => {
                    const isSelected = isStudent ? formData.gradeLevel === option : formData.subjectsTaught === option;
                    return (
                      <button
                        key={option}
                        onClick={() => isStudent 
                          ? setFormData({ ...formData, gradeLevel: option })
                          : setFormData({ ...formData, subjectsTaught: option })
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/10 text-white" 
                            : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                <p className="text-sm text-on-surface-variant">
                  What's your primary goal on EduAgent?
                </p>
                <div className="flex flex-col gap-2">
                  {(isStudent ? studentGoals : teacherGoals).map(goal => {
                    const isSelected = formData.bio === goal;
                    return (
                      <button
                        key={goal}
                        onClick={() => setFormData({ ...formData, bio: goal })}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/10 text-white" 
                            : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary px-6 py-2.5 text-sm font-bold text-background-deep transition-all hover:opacity-90"
            >
              {step === 1 ? "Complete Setup" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
