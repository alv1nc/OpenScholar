"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Filter, FileText, Users, GraduationCap, Building } from 'lucide-react';
import { PaperCard, Paper } from '@/components/PaperCard';
import Link from 'next/link';
import api from '@/lib/api';

interface UserResult {
  id: string;
  name: string;
  role: string;
  department: string | null;
}

const DEPARTMENTS = [
  'Computer Science',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical',
  'Civil',
  'Biology',
];

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex justify-center items-center py-10 text-muted-foreground animate-pulse">Loading search interface...</div>}>
      <SearchContent />
    </React.Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'papers' | 'people'>('papers');

  // Papers state
  const [paperQuery, setPaperQuery] = useState(initialQuery);
  const [searchBy, setSearchBy] = useState('title');
  const [paperDepartment, setPaperDepartment] = useState('');
  const [paperResults, setPaperResults] = useState<Paper[]>([]);
  const [papersLoading, setPapersLoading] = useState(false);

  // People state
  const [peopleQuery, setPeopleQuery] = useState('');
  const [peopleDepartment, setPeopleDepartment] = useState('');
  const [peopleResults, setPeopleResults] = useState<UserResult[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);

  // Papers search effect
  useEffect(() => {
    if (activeTab !== 'papers') return;
    const timer = setTimeout(async () => {
      setPapersLoading(true);
      try {
        const params = new URLSearchParams();
        if (paperQuery) params.set('q', paperQuery);
        if (searchBy) params.set('searchBy', searchBy);
        if (paperDepartment) params.set('department', paperDepartment);
        const res = await api.get(`/papers?${params.toString()}`);
        setPaperResults(res.data.papers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPapersLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [paperQuery, searchBy, paperDepartment, activeTab]);

  // People search effect
  useEffect(() => {
    if (activeTab !== 'people') return;
    if (!peopleQuery.trim() && !peopleDepartment) {
      setPeopleResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setPeopleLoading(true);
      try {
        const params = new URLSearchParams();
        if (peopleQuery) params.set('q', peopleQuery);
        if (peopleDepartment) params.set('department', peopleDepartment);
        const res = await api.get(`/users/search/query?${params.toString()}`);
        setPeopleResults(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPeopleLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [peopleQuery, peopleDepartment, activeTab]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8 p-1 bg-muted rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('papers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'papers'
              ? 'bg-white text-primary shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          Papers
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'people'
              ? 'bg-white text-primary shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          People
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar — changes based on tab */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" /> Filters
            </h3>
            <div className="space-y-4">
              {/* Department filter — common to both tabs */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Department</label>
                <select
                  value={activeTab === 'papers' ? paperDepartment : peopleDepartment}
                  onChange={(e) =>
                    activeTab === 'papers'
                      ? setPaperDepartment(e.target.value)
                      : setPeopleDepartment(e.target.value)
                  }
                  className="w-full bg-white border border-border text-foreground rounded-md py-2 px-3 text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Year filter — Papers only */}
              {activeTab === 'papers' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Year</label>
                  <select className="w-full bg-white border border-border text-foreground rounded-md py-2 px-3 text-sm focus:ring-primary focus:border-primary">
                    <option value="">Any Year</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1">

          {/* ---- PAPERS TAB ---- */}
          {activeTab === 'papers' && (
            <>
              <div className="flex gap-2 mb-8">
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="bg-white border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none shadow-sm min-w-[140px] md:min-w-[160px] font-medium"
                >
                  <option value="title">Title only</option>
                  <option value="author">Author only</option>
                </select>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={paperQuery}
                    onChange={(e) => setPaperQuery(e.target.value)}
                    placeholder="Search papers..."
                    className="block w-full pl-12 pr-4 py-4 text-lg bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {papersLoading ? 'Searching...' : `Found ${paperResults.length} result(s)`}
                </h2>

                {papersLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-white border border-border rounded-xl" />
                    ))}
                  </div>
                ) : paperResults.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {paperResults.map((paper) => (
                      <PaperCard key={paper.id} paper={paper} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white border border-border rounded-xl">
                    <p className="text-lg text-muted-foreground">
                      {paperQuery ? `No papers found matching "${paperQuery}"` : 'Start typing to search for papers.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ---- PEOPLE TAB ---- */}
          {activeTab === 'people' && (
            <>
              <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={peopleQuery}
                  onChange={(e) => setPeopleQuery(e.target.value)}
                  placeholder="Search people by name..."
                  className="block w-full pl-12 pr-4 py-4 text-lg bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {peopleLoading
                    ? 'Searching...'
                    : peopleQuery || peopleDepartment
                    ? `Found ${peopleResults.length} result(s)`
                    : 'Type a name or select a department to search for people.'}
                </h2>

                {peopleLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-white border border-border rounded-xl" />
                    ))}
                  </div>
                ) : peopleResults.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {peopleResults.map((person) => (
                      <Link
                        key={person.id}
                        href={`/profile/${person.id}`}
                        className="flex items-center gap-4 bg-white border border-border rounded-xl p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {person.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{person.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 capitalize">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {person.role}
                            </span>
                            {person.department && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3.5 h-3.5" />
                                {person.department}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-primary font-medium">View Profile →</span>
                      </Link>
                    ))}
                  </div>
                ) : (peopleQuery || peopleDepartment) ? (
                  <div className="text-center py-12 bg-white border border-border rounded-xl">
                    <p className="text-lg text-muted-foreground">No people found.</p>
                  </div>
                ) : null}
              </div>
            </>
          )}

        </main>
      </div>

    </div>
  );
}
