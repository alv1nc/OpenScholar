import { NextResponse } from 'next/server';
import { mockMessages } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = mockMessages[id as keyof typeof mockMessages] || [];
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { text } = await request.json();
  
  // Pretend we saved the message
  const newMessage = {
    id: "m" + Date.now(),
    senderId: "u1",
    text,
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ message: newMessage });
}
