// app/transcript/TranscriptPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import GradeTranscript from "@/app/components/GradeTranscript";
import { getGrade } from "@/app/grades/helpers/grade";

interface Props {
  studentId: string;
  program: string;
  name: string;
}

export default function TranscriptPageClient({ studentId, program, name }: Props) {
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateGradePoint = (users: any[]) => {
    return users.map((user: any) => {
      const gradePoint = getGrade(user["Grade"])?.gpa || 0;
      return {
        "Course code": user.Course_Code,
        "Default Class Name": user.Course_Name,
        Credits: user.Credits,
        "Last Attempt": user.Last_Attempt || undefined,
        Grade: user.Grade || undefined,
        "Grade Point": gradePoint,
      };
    });
  };

  // 🔹 Fetch grades for the student
  useEffect(() => {
    if (!studentId) return;

    const fetchGrades = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/grade?studentId=${studentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch grades");
        const data = await res.json();
        setGrades(data ? calculateGradePoint(data) : []);
      } catch (err: any) {
        console.error("Error fetching grades:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId]);

  // 🔹 Get program details from localStorage
  useEffect(() => {
    const cached = localStorage.getItem("programs");
    if (cached && program) {
      try {
        const programs = JSON.parse(cached);
        // You probably meant to find the correct program object
        const selected = programs.find(
          (p: any) => p.Program_Code === program || p.ProgramName === program
        );
        setSelectedProgram(selected || null);
      } catch (err) {
        console.error("Failed to parse cached programs:", err);
      }
    }
  }, [program]);

  if (error) return <p>❌ Error: {error}</p>;
  if (loading) return <p>Loading transcript...</p>;
  if (!studentId || !name) return <p>❌ Missing student details.</p>;

  return (
    <GradeTranscript
      studentName={name}
      program={selectedProgram?.ProgramName || program}
      programStartDate={selectedProgram?.ProgramStartDate || "2024-09-01"}
      enrollmentNo={studentId}
      printDate={new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      selectedProgram={selectedProgram}
      courses={grades}
    />
  );
}
