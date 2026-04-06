"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Search, MessageSquare, User, LogOut, ChevronDown, ShieldAlert } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchUnread = () => {
      api.get('/conversations/unread-count')
         .then(res => setUnreadMessagesCount(res.data.unreadCount || 0))
         .catch(err => console.error("Unread sum network err:", err));
    };

    fetchUnread(); // Initial pull
    const intervalId = setInterval(fetchUnread, 5000); // 5 sec live polling
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null; // Only show on authenticated routes

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex justify-center items-center font-serif text-white font-bold">O</div>
              OpenScholar
            </Link>
          </div>


          {/* Right Actions */}
          <div className="flex items-center gap-6 ml-auto">
            
            {/* Search */}
            <Link href="/search" className="group relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200">
              <Search className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </Link>

            {/* Messages */}
            <Link href="/messages" className="group relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200">
              <MessageSquare className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-error rounded-full">
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center gap-2 text-sm focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-medium transition-all duration-200 group-hover:bg-primary/30 group-hover:border-primary group-hover:scale-105 group-hover:shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-200">{user?.name}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground hidden md:block transition-transform duration-200 group-hover:text-foreground ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 border border-border">
                  <div className="py-1">
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="group flex items-center px-4 py-2 text-sm text-primary font-bold hover:bg-primary/10"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ShieldAlert className="mr-3 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href={`/profile/${user?.id}`}
                      className="group flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
