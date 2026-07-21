"use client";

import { forwardRef } from "react";
import { CsvRow } from "@/app/components/GradeParser";
import TranscriptPDF from "./TranscriptPDF";

interface TranscriptPrintTargetProps {
  studentName: string | undefined;
  program: string | null;
  enrollmentNo: string | undefined;
  coursesTranscript: CsvRow[];
  unfinishedCourses: Course[];
  creditsEarned: number;
  totalCredits: number;
  cumulativeGpa: number;
  programStatus: string;
  hasFail: boolean;
  rePrint: boolean;
  programStart: string;
  transcriptPrint: string;
  transcriptRePrint: string;
}

const TranscriptPrintTarget = forwardRef<
  HTMLDivElement,
  TranscriptPrintTargetProps
>(function TranscriptPrintTarget(
  {
    studentName,
    program,
    enrollmentNo,
    coursesTranscript,
    unfinishedCourses,
    creditsEarned,
    totalCredits,
    cumulativeGpa,
    programStatus,
    hasFail,
    rePrint,
    programStart,
    transcriptPrint,
    transcriptRePrint,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className="transcript-page printable-content print-area"
      style={{ width: "100%", maxWidth: "572pt", marginTop: "20px" }}
    >
      <TranscriptPDF
        studentName={studentName}
        program={program}
        enrollmentNo={enrollmentNo}
        coursesTranscript={coursesTranscript}
        unfinishedCourses={unfinishedCourses}
        creditsEarned={creditsEarned}
        totalCredits={totalCredits}
        cumulativeGpa={cumulativeGpa}
        programStatus={programStatus}
        hasFail={hasFail}
        rePrint={rePrint}
        programStart={programStart}
        transcriptPrint={transcriptPrint}
        transcriptRePrint={transcriptRePrint}
      />
    </div>
  );
});

export default TranscriptPrintTarget;