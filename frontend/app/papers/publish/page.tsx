"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import api from '@/lib/api';

const publishSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  abstract: z.string().min(50, "Abstract must be at least 50 characters"),
  authors: z.string().min(3, "At least one author is required"),
  keywords: z.string(),
  department: z.string().min(2, "Department is required"),
  year: z.string().regex(/^20\d{2}$/, "Must be a valid recent year"),
  doi: z.string().optional()
});

type PublishFormValues = z.infer<typeof publishSchema>;

export default function PublishPaperPage() {
  const router = useRouter();
  const [fileError, setFileError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [citationQuery, setCitationQuery] = useState("");
  const [citationResults, setCitationResults] = useState<any[]>([]);
  const [selectedCitations, setSelectedCitations] = useState<{id: string, title: string}[]>([]);

  React.useEffect(() => {
    if (citationQuery.trim().length === 0) {
      setCitationResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/papers?q=${encodeURIComponent(citationQuery)}`);
        // Filter out already selected
        const matches = res.data.papers.filter((p: any) => !selectedCitations.some(sc => sc.id === p.id));
        setCitationResults(matches);
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [citationQuery, selectedCitations]);
  
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      year: new Date().getFullYear().toString()
    }
  });

  const onSubmit = async (data: PublishFormValues) => {
    setFileError(null);
    setGlobalError(null);
    
    if (!selectedFile) {
      setFileError("A PDF file is required.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFileError("Only .pdf files are allowed.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('abstract', data.abstract);
      formData.append('authors', data.authors); // In reality we'd split strings to array but API handles it
      formData.append('keywords', data.keywords);
      formData.append('department', data.department);
      formData.append('year', data.year);
      formData.append('doi', data.doi || '');
      formData.append('citedPaperIds', JSON.stringify(selectedCitations.map(c => c.id)));
      formData.append('file', selectedFile);

      // Axios will natively detect FormData and inject the multipart boundary tag on its own.
      const res = await api.post('/papers', formData);
      
      router.push(`/papers/${res.data.paper.id}`);
    } catch (err) {
      const error = err as any;
      setGlobalError(error.response?.data?.error || "Failed to publish paper. Please try again.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Publish a Paper</h1>
        <p className="text-muted-foreground mt-2">Submit your research to the institutional repository.</p>
      </div>

      {globalError && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md mb-6">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-border p-8 rounded-2xl shadow-sm">
        
        {/* PDF Upload Area */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Paper PDF Document</label>
          <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${fileError ? 'border-error bg-error/5' : 'border-border hover:border-primary/50 bg-background/50'}`}>
            <div className="space-y-2 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="flex text-sm text-muted-foreground justify-center">
                <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                  <span>Upload a file</span>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setFileError(null);
                      }
                    }} 
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-muted-foreground">PDF up to 50MB</p>
              {selectedFile && <p className="text-sm font-medium text-emerald-600 mt-2">Selected: {selectedFile.name}</p>}
            </div>
          </div>
          {fileError && <p className="mt-2 text-sm text-error">{fileError}</p>}
        </div>

        {/* Metadata Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input type="text" {...register('title')} className={`w-full bg-background border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 ${errors.title ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`} />
            {errors.title && <p className="mt-1 text-sm text-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Abstract</label>
            <textarea {...register('abstract')} rows={4} className={`w-full bg-background border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 ${errors.abstract ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`} />
            {errors.abstract && <p className="mt-1 text-sm text-error">{errors.abstract.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Authors (comma separated)</label>
              <input type="text" {...register('authors')} className={`w-full bg-background border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 ${errors.authors ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`} placeholder="Jane Doe, John Smith" />
              {errors.authors && <p className="mt-1 text-sm text-error">{errors.authors.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Keywords</label>
              <input type="text" {...register('keywords')} className={`w-full bg-background border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 ${errors.keywords ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`} placeholder="Machine Learning, AI" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input type="text" {...register('department')} className={`w-full bg-background border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 ${errors.department ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`} />
              {errors.department && <p className="mt-1 text-sm text-error">{errors.department.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Year</label>
                <input type="text" {...register('year')} className={`w-full bg-background border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 ${errors.year ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`} />
                {errors.year && <p className="mt-1 text-sm text-error">{errors.year.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">DOI (Optional)</label>
                <input type="text" {...register('doi')} className="w-full bg-background border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Citations Block */}
        <div className="pt-6 border-t border-border">
          <label className="block text-sm font-medium text-foreground mb-2">References & Citations (Optional)</label>
          <div className="relative">
            <input 
              type="text" 
              value={citationQuery}
              onChange={e => setCitationQuery(e.target.value)}
              placeholder="Search OpenScholar to link references..."
              className="w-full bg-background border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
            />
            {citationResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                 {citationResults.map(p => (
                   <div key={p.id} onClick={() => {
                     setSelectedCitations(prev => [...prev, { id: p.id, title: p.title }]);
                     setCitationQuery("");
                     setCitationResults([]);
                   }} className="cursor-pointer p-3 hover:bg-muted border-b border-border">
                     <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                     <p className="text-xs text-muted-foreground">{p.authors.join(', ')}</p>
                   </div>
                 ))}
              </div>
            )}
            {citationQuery.length > 2 && citationResults.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">No matching papers found.</p>
                <p className="text-xs text-muted-foreground mt-1">Please select an existing OpenScholar paper from the dropdown.</p>
              </div>
            )}
          </div>
          
          {selectedCitations.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedCitations.map(sc => (
                <div key={sc.id} className="flex justify-between items-center bg-muted/50 border border-border p-2 rounded-md">
                  <span className="text-sm text-foreground truncate mr-4">{sc.title}</span>
                  <button type="button" onClick={() => setSelectedCitations(prev => prev.filter(x => x.id !== sc.id))} className="text-muted-foreground hover:text-error text-xs font-medium px-2 py-1 bg-background rounded border border-border">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-md font-medium transition-colors border border-transparent shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Publish to Directory
          </button>
        </div>

      </form>
    </div>
  );
}
