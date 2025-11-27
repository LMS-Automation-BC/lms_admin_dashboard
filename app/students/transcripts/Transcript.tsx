// app/transcript/TranscriptPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import GradeTranscript from "@/app/students/transcripts/GradeTranscript";
import { getGrade } from "@/app/grades/helpers/grade";
import UnfinishedCoursesList, { getUnfinishedCourses } from "./UnfinishedCoursesList";

interface Props {
  studentId: string;
  sisId:string;
  program: string;
  name: string;
  startDate: string;
}

export default function TranscriptPageClient({
  studentId,
  sisId,
  program,
  name,
  startDate,
}: Props) {
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateGradePoint = (selectedProgram: any[], users: any[]) => {
    const programCourseNames = new Set(
      selectedProgram.map((course) => course.Course_Name.toLowerCase().trim())
    );
    return sortUserGrades(selectedProgram, users).map((user: any) => {
      const gradePoint = getGrade(user["Grade"])?.gpa || 0;
      const userCourseName = (user.Default_Course_Name || "")
        .toLowerCase()
        .trim();

      const isInProgram = userCourseName
        ? Array.from(programCourseNames).some(
            (programName) =>
              programName.includes(userCourseName) ||
              userCourseName.includes(programName)
          )
        : false;
      return {
        "Course_Code": user.Course_Code,
        "Default_Course_Name": user.Default_Course_Name || user.Course_Name,
        Credits: user.Credits,
        "Last_Attempt": user.Last_Attempt || undefined,
        Grade: user.Grade || undefined,
        "Grade_Point": gradePoint,
        isInProgram,
      };
    });
  };

  // 🔹 Fetch grades for the student
  useEffect(() => {
    let selected = [];
    if (!studentId) return;
    const cached = localStorage.getItem("programs");
    if (cached && program) {
      try {
        const programs = JSON.parse(cached);
        // You probably meant to find the correct program object
        selected = programs[program];

        setSelectedProgram(selected);
      } catch (err) {
        console.error("Failed to parse cached programs:", err);
      }
    }
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?studentId=${studentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch grades");
        const data = await res.json();
        setGrades(data ? calculateGradePoint(selected, data) : []);
      } catch (err: any) {
        console.error("Error fetching grades:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId, program]);

  if (error) return <p>❌ Error: {error}</p>;
  if (loading) return <p>Loading transcript...</p>;
  if (!studentId || !name) return <p>❌ Missing student details.</p>;

  return (
    <>
      
     
      <GradeTranscript
        sisId= {sisId}
        studentName={name}
        program={program}
        programStartDate={startDate || "2025-01-09"}
        enrollmentNo={studentId}
        printDate={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        selectedProgram={selectedProgram}
        courses={grades}
      />
    </>
  );
}
function sortUserGrades(programCourses: any[], userGrades: any[]): any[] {
  // Step 1: Build lookup maps
  const courseNameToIndex: Record<string, number> = {};
  const courseNameToCode: Record<string, string> = {};

  programCourses.forEach((course: any, index: number) => {
    const name = course.Course_Name.toLowerCase().trim();
    courseNameToIndex[name] = index;
    courseNameToCode[name] = course.Course_Code;
  });

  // Step 2: Map user grades to ensure Course_Code exists
  const mappedGrades = userGrades.map((grade: any) => {
    const nameKey = grade.Default_Course_Name?.toLowerCase()?.trim();
    if (nameKey && courseNameToCode[nameKey]) {
      return { ...grade, Course_Code: courseNameToCode[nameKey] };
    }
    return grade; // leave as-is if no match
  });

  // Step 3: Sort by program course order
  const sorted = [...mappedGrades].sort((a: any, b: any) => {
    const aIndex =
      courseNameToIndex[a.Default_Course_Name?.toLowerCase()?.trim()] ??
      Infinity;
    const bIndex =
      courseNameToIndex[b.Default_Course_Name?.toLowerCase()?.trim()] ??
      Infinity;
    return aIndex - bIndex;
  });
  const completedCourses = new Set(
    userGrades.map((grade) => grade.Default_Course_Name?.toLowerCase()?.trim())
  );

  return sorted;
}
