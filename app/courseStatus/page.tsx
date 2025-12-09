// app/dashboard/page.tsx or pages/dashboard.tsx
"use client";
import { useEffect, useState } from "react";
import styles from "./CourseStatus.module.css";
import CourseMatrix from "./CourseMatrix";

export default function CourseStatus() {
  const [programs, setPrograms] = useState<ProgramsMap>({});
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any>();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setPrograms(data);
      })
      .catch(console.error);
  }, []);
  useEffect(() => {
    if(selectedProgram){
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?program=${encodeURIComponent(selectedProgram || '')}`
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setStudents(data);
      })
      .catch(console.error);}
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
        
            {selectedProgram && <CourseMatrix
              selectedProgram={selectedProgram}
              programs={programs}
              students={students}
            />
            }
        
      </>
    );
  }
}
