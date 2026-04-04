import { NextResponse } from 'next/server';
import { mockPapers, mockComments } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paper = mockPapers.find(p => p.id === id);
  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  // Also send along the comments mock
  const comments = mockComments.filter(c => c.paperId === id);

  return NextResponse.json({ paper, comments });
}
