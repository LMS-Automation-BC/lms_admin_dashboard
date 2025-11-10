// app/transcript/page.tsx or pages/transcript.tsx
"use client";
import GradeTranscript from "@/app/components/GradeTranscript";
import { getGrade } from "@/app/grades/helpers/grade";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function TranscriptPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams?.get("studentId");
  const program = searchParams?.get("program");

  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const calculateGradePoint = (users: any[]) => {
    let processedusers = users.map((user: any) => {
      const percent = Number(user["Percent%"]) || 0;
      const credits = Number(user["Credits"]) || 0;
      const gradePoint = getGrade(user["Grade"])?.gpa || 0;

      //   const gpa = credits * gradePoint;
      user["Grade Point"] = gradePoint;
      let transformed = {
        "Course code": user.Course_Code,
        "Default Class Name": user.Course_Name,
        Credits: user.Credits,
        // You can map optional fields if your data has them
        "Last Attempt": user.Last_Attempt || undefined,
        Grade: user.Grade || undefined,
        "Grade Point": gradePoint, // or map from another field if available
      };
      return transformed;
    });
    return processedusers;
  };
  const cached = localStorage.getItem("programs");
    if (cached && program) {
      let programs = JSON.parse(cached);
      let selectedProgram = programs[program]
    } 
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
        const calculated = data ? calculateGradePoint(data) : [];
        setGrades(calculated);
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

        // Find program by code or name
        const selected =
          programs[program]

        setSelectedProgram(selected);
      } catch (err) {
        console.error("Failed to parse cached programs:", err);
      }
    }
  }, [program]);

  if (loading && !selectedProgram) return <p>Loading transcript...</p>;

  if (!studentId) return <p>❌ Missing student ID in query params.</p>;
  if (loading) return <p>Loading transcript...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <GradeTranscript
      studentName="John Doe"
      program="Computer Science"
      programStartDate="2024-09-01"
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
