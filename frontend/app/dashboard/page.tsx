"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, Search, MessageSquare, User as UserIcon } from 'lucide-react';
import { PaperCard, Paper } from '@/components/PaperCard';
import api from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/papers/recent')
        .then(res => {
          setRecentPapers(res.data.papers);
          setLoadingPapers(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingPapers(false);
        });
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) return null; // Avoid flashing content

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Section */}
      <section className="bg-white border border-border rounded-2xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Welcome to OpenScholar
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Discover, publish, and discuss academic research within your institution.
            Connect with peers and faculty across departments.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link href="/papers/publish" className="group flex flex-col items-center bg-white border border-border rounded-xl p-6 hover:bg-zinc-50 hover:border-primary/50 transition-all text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-foreground font-medium">Publish a Paper</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload PDF and metadata</p>
          </Link>

          <Link href="/search" className="group flex flex-col items-center bg-white border border-border rounded-xl p-6 hover:bg-zinc-50 hover:border-primary/50 transition-all text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-foreground font-medium">Search Directory</h3>
            <p className="text-sm text-muted-foreground mt-1">Find research output</p>
          </Link>

          <Link href="/messages" className="group flex flex-col items-center bg-white border border-border rounded-xl p-6 hover:bg-zinc-50 hover:border-primary/50 transition-all text-center">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-foreground font-medium">Messages</h3>
            <p className="text-sm text-muted-foreground mt-1">Discuss with peers</p>
          </Link>

          <Link href={`/profile/${user?.id}`} className="group flex flex-col items-center bg-white border border-border rounded-xl p-6 hover:bg-zinc-50 hover:border-primary/50 transition-all text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserIcon className="w-6 h-6" />
            </div>
            <h3 className="text-foreground font-medium">Your Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">View your uploads</p>
          </Link>

        </div>
      </section>

      {/* Recent Uploads */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Latest Research</h2>
        {loadingPapers ? (
          <div className="text-muted-foreground animate-pulse">Loading latest papers...</div>
        ) : recentPapers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recentPapers.map(paper => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground bg-white border border-border rounded-xl p-8 text-center italic">
            No recent papers found. Be the first to publish!
          </div>
        )}
      </section>

    </div>
  );
}
