import { NextResponse } from 'next/server';
import { mockPapers } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({ papers: mockPapers });
}
