"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Participant {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: string;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex justify-center items-center py-10 text-muted-foreground animate-pulse">Loading messaging interface...</div>}>
      <MessagesContent />
    </React.Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch list of conversations
  useEffect(() => {
    api.get('/conversations').then(res => {
      setConversations(res.data.conversations || []);
      if (!activeConvId && res.data.conversations?.length > 0) {
        setActiveConvId(res.data.conversations[0].id);
      }
    }).catch(console.error);
  }, [activeConvId]);

  // Http Polling for active conversation messages
  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/conversations/${activeConvId}/messages`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchMessages(); // initial fetch

    // Poll every 3 seconds
    const intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId);
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const text = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const res = await api.post(`/conversations/${activeConvId}/messages`, { text });
      setMessages(prev => [...prev, res.data.message]);
    } catch (err) {
      console.error(err);
      // Rollback UI ideally, but mostly safe for mocked demo
    }
  };

  const getOtherParticipantName = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== user?.id)?.name || "Unknown User";
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex">
      
      <div className="bg-zinc-900 border border-border rounded-xl w-full flex overflow-hidden shadow-sm">
        
        {/* Left Panel: Conversations List */}
        <div className="w-1/3 border-r border-border bg-zinc-900/50 flex flex-col">
          <div className="p-4 border-b border-border bg-zinc-900">
            <h2 className="text-lg font-semibold text-white tracking-tight">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm text-center">No active conversations.</div>
            ) : (
              conversations.map(conv => {
                const isActive = activeConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-zinc-800 transition-colors flex items-center gap-3 ${isActive ? 'bg-zinc-800/80 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-medium border border-primary/20">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {getOtherParticipantName(conv)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate leading-relaxed">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Messages */}
        <div className="w-2/3 flex flex-col bg-background">
          {activeConvId ? (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-border bg-zinc-900/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-white">
                  {getOtherParticipantName(conversations.find(c => c.id === activeConvId)!)}
                </h3>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic">
                    Start of conversation
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user?.id || msg.senderId === 'u1'; // Assume u1 is the mock 'me' for visual purposes
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-border'
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-zinc-900/50 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-zinc-900 border border-border rounded-full px-4 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
