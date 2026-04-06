"use client";

import Link from 'next/link';
import { BookOpen, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Navigation / Header for Landing Page */}
      <header className="absolute top-0 w-full px-6 py-6 flex justify-between items-center z-10 w-max-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex justify-center items-center font-serif text-white font-bold">O</div>
          <span className="text-xl font-bold tracking-tight text-foreground">OpenScholar</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
            The Future of <span className="text-primary">Academic Research</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover, publish, and discuss academic papers within a centralized institutional repository. 
            Connect with peers and faculty across departments to accelerate innovation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-border hover:border-primary/30 hover:bg-zinc-50 text-foreground font-medium rounded-full transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-24 text-left">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Publish Instantly</h3>
            <p className="text-muted-foreground">Upload your PDF papers and metadata directly to the repository and make your work accessible.</p>
          </div>
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Discover Research</h3>
            <p className="text-muted-foreground">Search through all institutional publications dynamically by department, year, and author.</p>
          </div>
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Collaborate</h3>
            <p className="text-muted-foreground">Discuss papers right on the platform and message other researchers in real-time.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
