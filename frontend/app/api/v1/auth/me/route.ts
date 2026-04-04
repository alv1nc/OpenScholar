import { NextResponse } from 'next/server';
import { mockUser } from '@/lib/mockData';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Basic mock check: if token provided, return user, otherwise 401
  if (authHeader && authHeader.startsWith('Bearer mock_access_token')) {
    return NextResponse.json({ user: mockUser });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
