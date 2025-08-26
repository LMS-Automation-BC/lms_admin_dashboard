import { NextRequest, NextResponse } from "next/server";
import {
  getSessionsForClass,
  getAttendanceForSession,
} from "./attendance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId") ?? "";
  const start = searchParams.get("startDate") ?? "";
  const end = searchParams.get("endDate") ?? "";

  try {
    
    const sessions = await getSessionsForClass(classId, start, end);
    console.log(`Found ${sessions?.length} sessions`);
    const allAttendance = [];
    for (const session of sessions) {
      const attendance = await getAttendanceForSession(
       classId,
        session.id
      );
      allAttendance.push({
        sessionId: session.id,
        sessionDate: session.started_at,
        attendance,
      });
    }

    return NextResponse.json(allAttendance);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
