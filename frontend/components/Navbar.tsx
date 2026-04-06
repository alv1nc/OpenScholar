"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Search, MessageSquare, User, LogOut, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!isAuthenticated) return null; // Only show on authenticated routes

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex justify-center items-center font-serif">O</div>
              OpenScholar
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden sm:block">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search papers, authors, departments..."
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            
            {/* Messages */}
            <Link href="/messages" className="relative text-muted-foreground hover:text-white transition-colors">
              <MessageSquare className="h-6 w-6" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-error rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-muted-foreground font-medium">{user?.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-900 ring-1 ring-black ring-opacity-5 border border-border">
                  <div className="py-1">
                    <Link
                      href={`/profile/${user?.id}`}
                      className="group flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-white" />
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-white" />
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
