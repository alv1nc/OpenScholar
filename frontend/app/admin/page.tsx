"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trash2, Shield, UserCheck, Users, Database, Search, X } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'users' | 'papers'>('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [papersList, setPapersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [paperSearch, setPaperSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        if (activeTab === 'users') {
          const res = await api.get('/admin/users');
          setUsersList(res.data.users);
        } else {
          const res = await api.get('/admin/papers');
          setPapersList(res.data.papers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchData();
  }, [user, isAuthenticated, activeTab, router]);

  // Derived filtered lists — instant, no extra API calls
  const filteredUsers = usersList.filter(u => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const filteredPapers = papersList.filter(p => {
    const q = paperSearch.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.user?.name || '').toLowerCase().includes(q) || (p.department || '').toLowerCase().includes(q);
  });

  const handleTabChange = (tab: 'users' | 'papers') => {
    setActiveTab(tab);
    setUserSearch('');
    setPaperSearch('');
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("WARNING: Triggers CASCADE WIPEOUT. ALL papers, messages, and comments from this user will be irrecoverably destroyed. Proceed?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsersList(usersList.filter(u => u.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || "Error deleting user");
    }
  };

  const handleElevateRole = async (id: string, newRole: string) => {
    if (!confirm(`Are you sure you want to promote this user to ${newRole.toUpperCase()}?`)) return;
    try {
      await api.post(`/admin/users/${id}/role`, { role: newRole });
      setUsersList(usersList.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (e) {
      alert("Error updating privileges.");
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm("WARNING: Triggers CASCADE WIPEOUT. Paper, its PDF, its Citations, and all Comments within it will be destroyed. Proceed?")) return;
    try {
      await api.delete(`/admin/papers/${id}`);
      setPapersList(papersList.filter(p => p.id !== id));
    } catch (e) {
      alert("Error shredding paper entity.");
    }
  };

  if (isLoading && usersList.length === 0 && papersList.length === 0) {
    return <div className="flex-1 flex justify-center items-center"><div className="animate-pulse">Accessing Core Databases...</div></div>;
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">System Governance</h1>
          <p className="text-muted-foreground mt-1">Direct database access & entity resolution.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-border pb-2">
        <button 
          onClick={() => handleTabChange('users')}
          className={`flex items-center gap-2 px-4 py-2 font-medium bg-transparent border-b-2 transition-all ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'}`}
        >
          <Users className="w-4 h-4" /> User Base
          {usersList.length > 0 && <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{usersList.length}</span>}
        </button>
        <button 
          onClick={() => handleTabChange('papers')}
          className={`flex items-center gap-2 px-4 py-2 font-medium bg-transparent border-b-2 transition-all ${activeTab === 'papers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'}`}
        >
          <Database className="w-4 h-4" /> Global Library
          {papersList.length > 0 && <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{papersList.length}</span>}
        </button>
      </div>

      {/* Tab Payload */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {userSearch && (
                <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredUsers.length} of {usersList.length} users
            </span>
          </div>

          <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Account</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Role Matrix</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Destructive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      {userSearch ? `No users match "${userSearch}"` : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-error/10 text-error' : u.role === 'faculty' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-800'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {u.role === 'student' && (
                          <button onClick={() => handleElevateRole(u.id, 'faculty')} className="text-primary hover:bg-primary/10 px-3 py-1 rounded inline-flex items-center gap-1 border border-primary/20">
                            <UserCheck className="w-3 h-3"/> Make Faculty
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => handleElevateRole(u.id, 'admin')} className="text-error hover:bg-error/10 px-3 py-1 rounded inline-flex items-center gap-1 border border-error/20">
                            <Shield className="w-3 h-3"/> Grant Admin
                          </button>
                        )}
                        {u.id !== user?.id && (
                          <button onClick={() => handleDeleteUser(u.id)} className="text-error bg-error/5 hover:bg-error/20 px-3 py-1 rounded inline-flex items-center gap-1 border border-error/20 transition-colors">
                            <Trash2 className="w-3 h-3"/> Terminate
                          </button>
                        )}
                        {u.id === user?.id && (
                          <span className="text-muted-foreground text-xs italic px-2">Protected User</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'papers' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={paperSearch}
                onChange={e => setPaperSearch(e.target.value)}
                placeholder="Search by title, author, or department..."
                className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {paperSearch && (
                <button onClick={() => setPaperSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredPapers.length} of {papersList.length} papers
            </span>
          </div>

          <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Metrics</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Destruction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredPapers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      {paperSearch ? `No papers match "${paperSearch}"` : 'No papers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPapers.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-foreground line-clamp-1">{p.title}</div>
                        <div className="text-xs text-muted-foreground">Uploaded by: {p.user?.name} {p.department && `· ${p.department}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{p.citationCount} Citations</div>
                        <div className="text-xs text-muted-foreground">{p.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDeletePaper(p.id)} className="text-error bg-error/5 hover:bg-error/20 px-3 py-1 rounded inline-flex items-center gap-1 border border-error/20">
                          <Trash2 className="w-3 h-3"/> Shred Asset
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
