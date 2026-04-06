"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mail, Building, GraduationCap, MapPin, X, Loader2 } from 'lucide-react';
import { PaperCard, Paper } from '@/components/PaperCard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface EditForm {
  name: string;
  department: string;
}

export default function ProfilePage() {
  const { id } = useParams() as { id: string };
  const { user: currentUser, updateUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPapers, setUserPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', department: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (currentUser?.id === id) {
          setProfile(currentUser);
        } else {
          const userRes = await api.get(`/users/${id}`);
          setProfile(userRes.data.user);
        }

        const res = await api.get('/papers/recent');
        setUserPapers(res.data.papers.slice(0, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [id, currentUser]);

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditForm({ name: profile.name, department: profile.department || '' });
    setSaveError(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!profile) return;
    if (!editForm.name.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await api.patch(`/users/${profile.id}`, {
        name: editForm.name.trim(),
        department: editForm.department.trim(),
      });
      const updated = res.data.user as UserProfile;
      setProfile(updated);
      // Sync the in-memory auth session so navbar etc. update immediately
      updateUser({ name: updated.name, department: updated.department });
      setIsEditOpen(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMessage = async () => {
    try {
      const res = await api.post('/conversations', { userId: id });
      router.push(`/messages?conv=${res.data.conversation.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="flex-1 flex justify-center items-center text-muted-foreground">Loading...</div>;
  if (!profile) return <div className="flex-1 flex justify-center items-center text-error">User not found</div>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Profile Header */}
      <div className="bg-white border border-border rounded-3xl p-8 sm:p-12 mb-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden">

        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-shrink-0 w-32 h-32 rounded-full bg-muted border-4 border-background flex justify-center items-center text-muted-foreground text-5xl font-bold shadow-xl z-10">
          {profile.name.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left z-10 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{profile.name}</h1>
            <p className="text-primary mt-1 capitalize font-medium">{profile.role}</p>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {profile.department}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Campus A</span>
          </div>

          <div className="pt-2 flex gap-3 justify-center sm:justify-start">
            {isOwnProfile ? (
              <button
                onClick={handleOpenEdit}
                className="px-5 py-2 bg-white hover:bg-zinc-50 text-foreground rounded-md font-medium transition-colors border border-border shadow-sm"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleMessage}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-medium transition-colors border border-transparent shadow-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Message
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Publications List */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" /> Publications
          </h2>
        </div>

        {userPapers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {userPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl p-10 text-center text-muted-foreground italic">
            This user hasn&apos;t published any papers yet.
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="edit-name">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="edit-department">
                  Department
                </label>
                <select
                  id="edit-department"
                  className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={editForm.department}
                  onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                >
                  <option value="">Select a department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics and Communication">Electronics and Communication</option>
                  <option value="Electrical and Electronics">Electrical and Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              {saveError && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                  {saveError}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-foreground hover:bg-zinc-50 bg-white rounded-lg border border-border transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
