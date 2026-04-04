import { NextResponse } from 'next/server';
import { mockUser } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (email && password) {
      return NextResponse.json({
        accessToken: "mock_access_token_123",
        user: mockUser
      });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
