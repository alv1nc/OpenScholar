"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mail, Building, GraduationCap, MapPin } from 'lucide-react';
import { PaperCard, Paper } from '@/components/PaperCard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// Reusing MockData layout for types temporarily
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default function ProfilePage() {
  const { id } = useParams() as { id: string };
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPapers, setUserPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (currentUser?.id === id) {
          setProfile(currentUser);
        } else {
          const userRes = await api.get(`/users/${id}`);
          setProfile(userRes.data.user);
        }

        // Fetch their papers
        const res = await api.get('/papers/recent'); // Mock endpoint to get papers
        setUserPapers(res.data.papers.slice(0, 2));

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [id, currentUser]);

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
      <div className="bg-zinc-900 border border-border rounded-3xl p-8 sm:p-12 mb-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden">

        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-shrink-0 w-32 h-32 rounded-full bg-zinc-800 border-4 border-zinc-950 flex justify-center items-center text-zinc-500 text-5xl font-bold shadow-xl z-10">
          {profile.name.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left z-10 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{profile.name}</h1>
            <p className="text-primary mt-1 capitalize font-medium">{profile.role}</p>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {profile.department}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Campus A</span>
          </div>

          <div className="pt-2 flex gap-3 justify-center sm:justify-start">
            {isOwnProfile ? (
              <button className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-medium transition-colors border border-border shadow-sm">
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
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
          <div className="bg-zinc-900 border border-border rounded-xl p-10 text-center text-muted-foreground italic">
            This user hasn&apos;t published any papers yet.
          </div>
        )}
      </div>

    </div>
  );
}
