import { NextResponse } from 'next/server';
import { mockConversations } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({ conversations: mockConversations });
}

export async function POST(request: Request) {
  const { userId } = await request.json();
  
  // Return the existing conversation or create a dummy new one
  return NextResponse.json({ 
    conversation: { 
      id: "conv1", 
      participants: [{ id: "u1", name: "Me" }, { id: userId, name: "Other User" }] 
    } 
  });
}
