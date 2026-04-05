"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DownloadCloud, Users, Calendar, Building, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { Paper } from '@/components/PaperCard';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export default function PaperDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  
  const [paper, setPaper] = useState<Paper | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await api.get(`/papers/${id}`);
        setPaper(res.data.paper);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/papers/${id}/pdf`, { responseType: 'blob' });
      
      const fileBlob = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      
      // Force an actual disk download instead of opening a 'blob:' page which can be blocked
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `${paper?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'paper'}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      alert("Failed to securely download the PDF. Make sure the file exists on the server.");
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    // Optimistic UI updates
    const mockNewComment: Comment = {
      id: "mock_c_" + Date.now(),
      userId: user.id,
      authorName: user.name,
      content: newComment,
      createdAt: new Date().toISOString()
    };
    
    setComments([mockNewComment, ...comments]);
    setNewComment("");
  };

  if (isLoading) {
    return <div className="flex-1 flex justify-center items-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  if (!paper) {
    return <div className="flex-1 flex justify-center items-center text-error">Paper not found</div>;
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Paper Metadata Header */}
      <div className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
          {paper.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-medium text-white">{paper.authors.join(', ')}</span>
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {paper.year}
          </span>
          <span className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {paper.department}
          </span>
          <span className="flex items-center gap-2 px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-sm font-semibold">
            {paper.citationCount} Citations
          </span>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-medium transition-colors border border-transparent shadow-sm"
          >
            <DownloadCloud className="w-5 h-5" />
            View / Download PDF
          </button>
        </div>
      </div>

      {/* Abstract */}
      <div className="bg-zinc-900 border border-border rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-white mb-4">Abstract</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {paper.abstract}
        </p>
      </div>

      {/* Citation Details Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            Citation Network
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Total citations accumulated: <strong className="text-primary">{paper.citationCount}</strong>
          </p>
          <p className="text-xs text-muted-foreground italic border-t border-border pt-4 mt-4">
            Interactive citation mapping is arriving in a future update once the graph database is strictly localized.
          </p>
        </div>
      </div>

      {/* Comment Thread */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Discussion
        </h2>
        
        <form onSubmit={handlePostComment} className="flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your thoughts or ask the authors a question..."
            className="w-full bg-zinc-900 border border-border rounded-xl p-4 text-white placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none min-h-[100px]"
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-medium transition-colors border border-border disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </form>

        <div className="space-y-6 mt-8">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <Link href={`/profile/${comment.userId}`} className="font-semibold text-white hover:text-primary transition-colors cursor-pointer">
                    {comment.authorName}
                  </Link>
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                
                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm">
                          {reply.authorName.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-baseline gap-2">
                            <Link href={`/profile/${reply.userId}`} className="font-medium text-white hover:text-primary transition-colors text-sm cursor-pointer">
                              {reply.authorName}
                            </Link>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-muted-foreground italic text-center py-8 border border-dashed border-border rounded-xl">No discussion yet. Be the first to comment!</p>
          )}
        </div>
      </div>

    </div>
  );
}
