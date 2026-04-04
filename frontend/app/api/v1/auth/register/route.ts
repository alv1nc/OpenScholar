import { NextResponse } from 'next/server';
import { mockUser } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    return NextResponse.json({
      accessToken: "mock_access_token_123",
      user: { ...mockUser, name: data.fullName || mockUser.name, email: data.email || mockUser.email }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
