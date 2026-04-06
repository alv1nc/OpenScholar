"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DownloadCloud, Users, Calendar, Building, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
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

function CommentNode({ comment, paperId, onReplySuccess }: { comment: Comment; paperId: string; onReplySuccess: () => void }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/papers/${paperId}/comments`, { 
        content: replyContent,
        parentCommentId: comment.id
      });
      setReplyContent('');
      setIsReplying(false);
      onReplySuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to securely post reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
        {comment.authorName.charAt(0)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:bg-muted rounded p-0.5 transition-colors mb-0.5"
            aria-label={isCollapsed ? "Expand comment" : "Collapse comment"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <Link href={`/profile/${comment.userId}`} className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
            {comment.authorName}
          </Link>
          <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
          {isCollapsed && comment.replies && comment.replies.length > 0 && (
            <span className="text-xs text-primary/70 font-medium ml-1">({comment.replies.length} replies hidden)</span>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="pt-1">
            <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
            
            {user && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs font-semibold text-primary hover:underline mt-2 inline-block"
              >
                Reply
              </button>
            )}

            {isReplying && (
              <form onSubmit={handleReplySubmit} className="mt-3 flex flex-col gap-2">
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full bg-white border border-border rounded-xl p-3 text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none min-h-[60px]"
                />
                <div className="flex justify-start gap-2 pt-1">
                  <button 
                    type="submit"
                    disabled={!replyContent.trim() || isSubmitting}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs rounded transition-colors disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-muted-foreground hover:text-foreground border border-border rounded text-xs transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-6 border-l-2 border-border pl-4">
                {comment.replies.map(reply => (
                  <CommentNode 
                    key={reply.id} 
                    comment={reply} 
                    paperId={paperId} 
                    onReplySuccess={onReplySuccess} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaperDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  
  const [paper, setPaper] = useState<Paper | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  const fetchPaper = useCallback(async () => {
    try {
      const res = await api.get(`/papers/${id}`);
      setPaper(res.data.paper);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/papers/${id}/pdf`, { responseType: 'blob' });
      
      const fileBlob = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `${paper?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'paper'}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      alert("Failed to securely download the PDF. Make sure the file exists on the server.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    try {
      await api.post(`/papers/${id}/comments`, { content: newComment });
      setNewComment("");
      fetchPaper(); // Refetch to deeply populate nested replies map from DB
    } catch (err) {
      console.error(err);
      alert("Failed to securely post comment across the network.");
    }
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
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-snug">
          {paper.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-medium text-foreground">{paper.authors.join(', ')}</span>
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
      <div className="bg-white border border-border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">Abstract</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {paper.abstract}
        </p>
      </div>

      {/* Citation Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* References */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">References <span className="text-muted-foreground text-sm font-normal ml-2">(Papers cited)</span></h2>
          <div className="space-y-3">
            {(paper as any).citedBy?.length > 0 ? (
              (paper as any).citedBy.map((ref: any) => (
                <Link key={ref.cited.id} href={`/papers/${ref.cited.id}`} className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors bg-white">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2">{ref.cited.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{ref.cited.authors?.join(', ')} • {ref.cited.year}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic p-4 text-center border dashed border-border rounded-lg">No internal references linked.</p>
            )}
          </div>
        </div>

        {/* Citations */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Cited By <span className="text-muted-foreground text-sm font-normal ml-2">(Citing papers)</span></h2>
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{paper.citationCount}</span>
          </div>
          <div className="space-y-3">
            {(paper as any).citations?.length > 0 ? (
              (paper as any).citations.map((ref: any) => (
                <Link key={ref.citing.id} href={`/papers/${ref.citing.id}`} className="block p-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors bg-white shadow-sm">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2">{ref.citing.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{ref.citing.authors?.join(', ')} • {ref.citing.year}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic p-4 text-center border dashed border-primary/20 rounded-lg">No citations yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Comment Thread */}
      <div className="bg-white border border-border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl space-y-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5" /> Comments
        </h2>
        
        <form onSubmit={handlePostComment} className="flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your thoughts or ask the authors a question..."
            className="w-full bg-white border border-border rounded-xl p-4 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none min-h-[100px]"
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-white hover:bg-zinc-50 text-foreground rounded-md font-medium transition-colors border border-border disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </form>

        <div className="space-y-8 mt-8">
          {comments.map(comment => (
            <CommentNode 
              key={comment.id} 
              comment={comment} 
              paperId={id} 
              onReplySuccess={fetchPaper} 
            />
          ))}
          {comments.length === 0 && (
            <p className="text-muted-foreground italic text-center py-8 border border-dashed border-border rounded-xl">No discussion yet. Be the first to comment!</p>
          )}
        </div>
      </div>

    </div>
  );
}
