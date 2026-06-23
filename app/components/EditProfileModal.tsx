import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { updateUserProfile } from '../../lib/firestore';
import { X, Save, User, GraduationCap, Book } from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: Props) {
  const { userProfile, updateUserProfileFields } = useAppStore();
  
  const [formData, setFormData] = useState({
    bio: userProfile?.bio || '',
    gradeLevel: userProfile?.gradeLevel || '',
    subjectsTaught: userProfile?.subjectsTaught || '',
    school: userProfile?.school || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !userProfile) return null;

  const isTeacher = userProfile.role === 'teacher';

  const studentGrades = ["Middle School", "High School", "College/University", "Self-Taught", "Other"];
  const teacherSubjects = ["Mathematics", "Science", "Literature & English", "History & Humanities", "Computer Science", "Multiple Subjects"];
  
  const studentGoals = ["Improve my grades", "Prepare for standardized tests", "Learn a new skill or language", "Get help with homework"];
  const teacherGoals = ["Manage my classrooms", "Track student progress", "Create interactive quizzes", "Automate grading and analytics"];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!userProfile.isMock) {
        await updateUserProfile(userProfile.uid, formData);
      }
      updateUserProfileFields(formData);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (e) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-deep/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <h2 className="text-xl font-bold text-white">Edit Profile Details</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-on-surface-variant hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Bio / Learning Goals</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <select
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-primary/50 focus:bg-white/10 appearance-none"
              >
                <option value="" disabled className="bg-background-deep text-on-surface-variant">Select your primary goal...</option>
                {(isTeacher ? teacherGoals : studentGoals).map(goal => (
                  <option key={goal} value={goal} className="bg-background-deep text-white">{goal}</option>
                ))}
              </select>
            </div>
          </div>

          {!isTeacher ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Grade Level</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-primary/50 focus:bg-white/10 appearance-none"
                >
                  <option value="" disabled className="bg-background-deep text-on-surface-variant">Select your grade...</option>
                  {studentGrades.map(opt => (
                    <option key={opt} value={opt} className="bg-background-deep text-white">{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Subjects Taught</label>
              <div className="relative">
                <Book className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                <select
                  value={formData.subjectsTaught}
                  onChange={(e) => setFormData({ ...formData, subjectsTaught: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-primary/50 focus:bg-white/10 appearance-none"
                >
                  <option value="" disabled className="bg-background-deep text-on-surface-variant">Select your subject...</option>
                  {teacherSubjects.map(opt => (
                    <option key={opt} value={opt} className="bg-background-deep text-white">{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">School / Institution</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              placeholder="e.g. Springfield High"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 p-5 bg-black/10">
          <button 
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 text-sm font-bold text-background-deep transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
