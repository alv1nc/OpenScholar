"use client";

import Link from 'next/link';
import { BookOpen, Search, Users, MessageSquare, Download, Star, Shield, GitBranch, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const scrollingRef = useRef(false);

  // Smooth JS-driven scroll that works alongside CSS snap
  useEffect(() => {
    const container = containerRef.current;
    const features = featuresRef.current;
    if (!container || !features) return;

    const onWheel = (e: WheelEvent) => {
      // Only intercept on hero (when container is at top)
      if (container.scrollTop > 50 || scrollingRef.current) return;
      if (e.deltaY > 0) {
        e.preventDefault();
        scrollingRef.current = true;
        container.scrollTo({ top: features.offsetTop, behavior: 'smooth' });
        setTimeout(() => { scrollingRef.current = false; }, 900);
      }
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (container.scrollTop > 50 || scrollingRef.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (delta > 30) {
        scrollingRef.current = true;
        container.scrollTo({ top: features.offsetTop, behavior: 'smooth' });
        setTimeout(() => { scrollingRef.current = false; }, 900);
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

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
    <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-background">
      {/* Navigation / Header for Landing Page */}
      <header className="fixed top-0 w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex justify-center items-center font-serif text-white font-bold">O</div>
          <span className="text-xl font-bold tracking-tight text-foreground">OpenScholar</span>
        </div>
      </header>

      {/* Hero Section — full viewport, snap target */}
      <section ref={heroRef} className="snap-start h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative overflow-hidden flex-shrink-0">

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
              className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-border hover:border-primary/30 hover:bg-zinc-50 text-foreground font-medium rounded-full transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Feature Highlights — snap target, free scroll within */}
      <section ref={featuresRef} className="snap-start px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-foreground mb-3 text-center">Everything you need to do great research</h2>
        <p className="text-muted-foreground mb-12 text-center max-w-xl">A complete academic platform designed to make publishing, discovering, and collaborating effortless.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">

          {/* 1 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Publish Instantly</h3>
            <p className="text-muted-foreground text-sm">Upload your PDF papers and metadata directly to the repository and make your work accessible to the entire institution.</p>
          </div>

          {/* 2 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Smart Search</h3>
            <p className="text-muted-foreground text-sm">Search through all publications by title or author with real-time filtering by department, giving you precise, targeted results instantly.</p>
          </div>

          {/* 3 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">People Discovery</h3>
            <p className="text-muted-foreground text-sm">Browse researcher profiles across all departments. Find collaborators by name or department and explore their published work at a glance.</p>
          </div>

          {/* 4 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Threaded Discussions</h3>
            <p className="text-muted-foreground text-sm">Engage in deeply nested comment threads on any paper. Collapse, reply, and discuss ideas in a structured, Reddit-style discussion system.</p>
          </div>

          {/* 5 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600 mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">PDF Access</h3>
            <p className="text-muted-foreground text-sm">Download or view full-text PDFs directly from the platform. Every paper is securely stored and accessible to all institutional members.</p>
          </div>

          {/* 6 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Researcher Profiles</h3>
            <p className="text-muted-foreground text-sm">Every user gets a dedicated profile showcasing their publications, department, and role — your institution-wide academic identity, all in one place.</p>
          </div>

          {/* 7 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600 mb-4">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Citation Tracking</h3>
            <p className="text-muted-foreground text-sm">Track which papers cite your work and which papers you reference. Build a transparent citation graph across all institutional publications.</p>
          </div>

          {/* 8 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Real-time Messaging</h3>
            <p className="text-muted-foreground text-sm">Message any researcher on the platform directly. Start conversations from a profile or the messages hub — with live unread badge notifications.</p>
          </div>

          {/* 9 */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="w-12 h-12 bg-lime-500/10 rounded-xl flex items-center justify-center text-lime-600 mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Department Analytics</h3>
            <p className="text-muted-foreground text-sm">Browse publications by department and track research trends institution-wide. Understand where the most active research is happening.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
