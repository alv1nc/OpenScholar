import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, Calendar, Building, ChevronRight } from 'lucide-react';

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  department: string;
  citationCount: number;
}

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  return (
    <Link 
      href={`/papers/${paper.id}`}
      className="block group bg-white border border-border rounded-xl p-6 transition-all hover:bg-zinc-50 hover:border-primary/50 relative"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-3 flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {paper.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{paper.authors.join(', ')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {paper.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              {paper.department}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {paper.abstract}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-medium border border-primary/20">
            <BookOpen className="w-4 h-4" />
            {paper.citationCount} {paper.citationCount === 1 ? 'citation' : 'citations'}
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
