import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json({
    user: {
      id: id,
      name: "Dr. Mock Profile User",
      email: "mocked@openscholar.edu",
      role: "faculty",
      department: "Computer Science"
    }
  });
}
