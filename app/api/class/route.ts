import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? '';
  const start = searchParams.get('startDate') ?? '';
  const end = searchParams.get('endDate') ?? '';

  try {
    const res = await fetch(`https://brookescollege.neolms.com/api/v3/classes?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$filter={\"name\":\"${decodeURIComponent(name)}\"}&$include=parent,current_lesson,organization`);
    const data = await res.json();
    let sessionId;
    if(data[0]){
        const sessions = await fetch(`https://brookescollege.neolms.com/api/v3/classes/${data[0].id}/attendance_sessions?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$filter={"and":[{"gte":{"started_at":"${start}T00:00:00.000-06:00"}},{"lte":{"started_at":"${end}T23:59:59.999-06:00"}}]}&$limit=100`)
        sessionId = (await sessions.json())[0].id
    }
    return NextResponse.json({id: sessionId});
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
