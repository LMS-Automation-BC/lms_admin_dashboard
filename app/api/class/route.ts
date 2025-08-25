import { NextRequest, NextResponse } from "next/server";
import {
  getClassByName,
  getSessionsForClass,
  getAttendanceForSession,
} from "./attendance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const className = searchParams.get("name") ?? "";
  const start = searchParams.get("startDate") ?? "";
  const end = searchParams.get("endDate") ?? "";

  try {
    const classData = await getClassByName(className);
    if (!classData) {
      return NextResponse.json(
        { error: `Class "${className}" not found.` },
        { status: 404 }
      );
    }
    console.log(`Class Found: ${classData?.name} (ID: ${classData?.id})`);
    const sessions = await getSessionsForClass(classData.id, start, end);
    console.log(`Found ${sessions?.length} sessions`);
    const allAttendance = [];
    for (const session of sessions) {
      const attendance = await getAttendanceForSession(
        classData.id,
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
