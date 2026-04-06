"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { PaperCard, Paper } from '@/components/PaperCard';
import api from '@/lib/api';

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
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simple debounce and search
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/papers?q=${encodeURIComponent(query)}`);
        setResults(res.data.papers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Department</label>
                <select className="w-full bg-white border border-border text-foreground rounded-md py-2 px-3 text-sm focus:ring-primary focus:border-primary">
                  <option value="">All Departments</option>
                  <option value="cs">Computer Science</option>
                  <option value="physics">Physics</option>
                  <option value="biology">Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Year</label>
                <select className="w-full bg-white border border-border text-foreground rounded-md py-2 px-3 text-sm focus:ring-primary focus:border-primary">
                  <option value="">Any Year</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Search Results Area */}
        <main className="flex-1">
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords, titles, or authors..."
              className="block w-full pl-12 pr-4 py-4 text-lg bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {isLoading ? "Searching..." : `Found ${results.length} result(s)`}
            </h2>
            
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white border border-border rounded-xl"></div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {results.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-border rounded-xl">
                <p className="text-lg text-muted-foreground">No papers found matching &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}
