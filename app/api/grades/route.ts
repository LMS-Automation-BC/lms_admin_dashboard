import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lmsid = searchParams.get('lmsid') ?? '';
  

  try {
    const res = await fetch(`https://brookescollege.neolms.com/api/v3/users/${lmsid}/assignment_grades?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$include=class`);
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
