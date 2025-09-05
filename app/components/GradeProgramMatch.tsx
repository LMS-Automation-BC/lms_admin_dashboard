"use client";

import React, { useEffect, useState } from "react";
import { getMatchingProgram } from "../grades/helpers/courseList";

import { CsvRow } from "./GradeParser";
import "./GradeProgramMatch.css";
import { CoursesMap } from "../grades/helpers/grades.type";

interface GradeProgramMatchProps {
  csvData: CsvRow[];
  onProgramConfirm: (programName: string) => void;
  programs:CoursesMap;
}

const GradeProgramMatch: React.FC<GradeProgramMatchProps> = ({programs, csvData, onProgramConfirm }) => {
  const [matchedProgram, setMatchedProgram] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | "">("");


  useEffect(() => {
    console.log('csv change')
    if (csvData.length > 0) {
      
      const matched = getMatchingProgram(programs,csvData);
      setMatchedProgram(matched);
      if (matched) setSelectedProgram(matched);
    } else {
      setMatchedProgram(null);
    }
  }, [csvData]);

  const handleConfirm = () => {
    if (selectedProgram) {
      onProgramConfirm(selectedProgram);
    }
  };

  if (!csvData.length) return null;

  return (
   <div className="grade-program-match">
  {matchedProgram ? (
    <>
      <p>
        Detected program: <strong>{matchedProgram}</strong>. Confirm or choose another:
      </p>
      <select
        value={selectedProgram}
        onChange={(e) => setSelectedProgram(e.target.value)}
        style={{ marginRight: "1rem" }}
      >
        <option value="">-- Select a program --</option>
        {(Object.keys(programs)).map((programName) => (
          <option key={programName} value={programName}>
            {programName}
          </option>
        ))}
      </select>
      <button onClick={handleConfirm} disabled={!selectedProgram}>
        Confirm Program
      </button>
    </>
  ) : (
    <>
      <p>No exact match found. Please select your program:</p>
      <select
        value={selectedProgram}
        onChange={(e) => setSelectedProgram(e.target.value)}
        style={{ marginRight: "1rem" }}
      >
        <option value="">-- Select a program --</option>
        {(Object.keys(programs)).map((programName) => (
          <option key={programName} value={programName}>
            {programName}
          </option>
        ))}
      </select>
      <button onClick={handleConfirm} disabled={!selectedProgram}>
        Confirm Program
      </button>
    </>
  )}
</div>

  );
};

export default GradeProgramMatch;
