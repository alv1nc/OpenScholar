"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAccessToken } from '@/lib/api';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

type SetupState = 'loading' | 'available' | 'locked';

export default function SetupPage() {
  const router = useRouter();
  const [setupState, setSetupState] = useState<SetupState>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check on mount if setup is still available
  useEffect(() => {
    const check = async () => {
      try {
        // Try to hit the bootstrap endpoint without a token to see if it is available
        // We'll do a lightweight check by attempting login as a probe
        // Actually: we check admin count via a dedicated public endpoint
        const res = await api.get('/auth/setup-status');
        if (res.data.adminExists) {
          setSetupState('locked');
        } else {
          setSetupState('available');
        }
      } catch {
        // If the endpoint doesn't exist yet or fails, show available
        setSetupState('available');
      }
    };
    check();
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Step 1: Log in to get a JWT token
      const loginRes = await api.post('/auth/login', { email, password });
      const token = loginRes.data.token;
      setAccessToken(token);

      // Step 2: Call the bootstrap endpoint
      await api.post('/users/make-first-admin');

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setAccessToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (setupState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking system status...</div>
      </div>
    );
  }

  if (setupState === 'locked') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Setup Already Complete</h1>
          <p className="text-muted-foreground">An administrator account already exists. This setup wizard is permanently disabled.</p>
          <button onClick={() => router.push('/login')} className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You are now Admin!</h1>
          <p className="text-muted-foreground">Your account has been granted full administrator privileges. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">OpenScholar Setup</h1>
          <p className="text-muted-foreground mt-2">Claim the administrator seat for this instance.</p>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">One-time setup</p>
            <p className="text-xs text-amber-700 mt-0.5">This page works only once. After the first admin is created, it will permanently lock. Log in with the account you want to designate as administrator.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleClaim} className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-5">

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your-registered-email@example.com"
              className="w-full bg-background border border-border rounded-md py-2.5 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-border rounded-md py-2.5 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-md font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {isSubmitting ? 'Claiming Admin Seat...' : 'Claim Administrator Seat'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account yet?{' '}
          <a href="/register" className="text-primary hover:underline font-medium">Register first</a>, then return here.
        </p>

      </div>
    </div>
  );
}
