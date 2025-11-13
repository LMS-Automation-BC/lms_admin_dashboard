// app/dashboard/page.tsx or pages/dashboard.tsx
"use client";
import { useEffect, useState } from "react";
import styles from "./CourseStatus.module.css";

export default function CourseStatus() {
  const [programs, setPrograms] = useState<ProgramsMap>({});
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any>();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    fetch(
      "https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/program"
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setPrograms(data);
      })
      .catch(console.error);
  }, []);
  useEffect(() => {
    setLoading(true);
    fetch(`https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/grade?program=${selectedProgram}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setStudents(data);
      })
      .catch(console.error);
  }, [selectedProgram]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  else {
    return (
      <>
        <h2>Select Program</h2>
        <select
          value={selectedProgram || ""}
          onChange={(e) => {
            setSelectedProgram(e.target.value || null);
          }}
          className="select"
        >
          <option value="">-- Select Program --</option>
          {Object.keys(programs).map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>

        <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          <th>Course Name</th>
          {students &&
            Object.keys(students).map((student) => (
              <th key={student}>{student}</th>
            ))}
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {selectedProgram &&
          programs[selectedProgram].map((program) => (
            <tr key={program.Course_Code}>
              <td className={styles.courseName}>{program.Course_Name}</td>
              {students &&
                Object.keys(students).map((student) => {
                  const taken = students[student].some(
                    (x:any) => x.Default_Course_Name === program.Course_Name
                  );
                  return (
                    <td
                      key={student + program.Course_Name}
                      className={taken ? styles.taken : styles.notTaken}
                    >
                      {taken ? "✅" : "❌"}
                    </td>
                  );
                })}
            </tr>
          ))}
      </tbody>
    </table>
      </>
    );
  }
}
