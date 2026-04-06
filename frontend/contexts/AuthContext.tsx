"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAccessToken } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  department: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, try to fetch current user (checks if we have a valid session/refresh token)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const resp = await api.get('/auth/me'); // We need to mock this too
        setUser(resp.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    router.push('/dashboard');
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...partial } : prev);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    try {
      await api.post('/auth/logout'); // Optional endpoint to clear httpOnly cookie
    } catch {
      // Ignore errors on logout
    }
    
    if (typeof window !== 'undefined') {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        router.push('/login');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
