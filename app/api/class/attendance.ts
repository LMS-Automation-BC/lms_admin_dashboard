export const getClassByName = async (className: string) => {
  const res = await fetch(
    `https://brookescollege.neolms.com/api/v3/classes?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$filter={\"name\":\"${decodeURIComponent(
      className
    )}\"}&$include=parent,current_lesson,organization`
  );
  if (!res.ok) {
    const errorText = await res.text();
    console.log(errorText);
    throw "Failed to fetch class";
  }

  let classes = await res.json();
  if (!classes[0]) {
    console.log('searching archives for '+decodeURIComponent(
      className
    ))
    const archivedres = await fetch(
      `https://brookescollege.neolms.com/api/v3/classes?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&&$filter={\"and\":[{\"name\":\"${decodeURIComponent(
        className
      )}\"},{\"archived\":\"true\"}]}&$include=parent,current_lesson,organization`
    );
    if (!archivedres.ok) {
      const errorText = await archivedres.text();
      console.log(errorText);
      throw "Failed to fetch class";
    }
    classes = await archivedres.json();
  }
  return classes[0]; // assuming only one class matches
};

export const getSessionsForClass = async (
  classId: string,
  start: string,
  end: string
) => {
  const res = await fetch(
    `https://brookescollege.neolms.com/api/v3/classes/${classId}/attendance_sessions?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$filter={"and":[{"gte":{"started_at":"${start}T00:00:00.000-06:00"}},{"lte":{"started_at":"${end}T23:59:59.999-06:00"}}]}&$limit=100`
  );
  if (!res.ok) throw "Failed to fetch sessions";
  return await res.json();
};

export const getAttendanceForSession = async (
  classId: string,
  sessionId: string
) => {
  const res = await fetch(
    `https://brookescollege.neolms.com/api/v3/classes/${classId}/attendance_sessions/${sessionId}/user_attendance?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$limit=100`
  );
  if (!res.ok) throw `Failed to fetch attendance for session ${sessionId}`;
  return await res.json();
};
