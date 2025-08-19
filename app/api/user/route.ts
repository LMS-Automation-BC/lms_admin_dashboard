import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? '';

  try {
    const res = await fetch(`https://brookescollege.neolms.com/api/v3/users/${userId}?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
