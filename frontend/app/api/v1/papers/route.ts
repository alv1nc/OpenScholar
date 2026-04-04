import { NextResponse } from 'next/server';
import { mockPapers } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  const results = mockPapers.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.abstract.toLowerCase().includes(query) || 
    p.authors.some(a => a.toLowerCase().includes(query))
  );

  return NextResponse.json({ papers: results });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    
    return NextResponse.json({
      success: true,
      paper: {
        id: "new_paper_" + Date.now(),
        title,
        status: "published"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
