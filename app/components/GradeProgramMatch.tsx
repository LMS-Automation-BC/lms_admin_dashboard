"use client";

import React, { useEffect, useState } from "react";
import { getMatchingProgram } from "../grades/helpers/courseList";
import { programs } from "../grades/helpers/courseList";
import { CsvRow } from "./GradeParser";
import "./GradeProgramMatch.css";

interface GradeProgramMatchProps {
  csvData: CsvRow[];
  onProgramConfirm: (programName: string) => void;
}

const GradeProgramMatch: React.FC<GradeProgramMatchProps> = ({ csvData, onProgramConfirm }) => {
  const [matchedProgram, setMatchedProgram] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | "">("");


  useEffect(() => {
    if (csvData.length > 0) {
      const matched = getMatchingProgram(csvData);
      setMatchedProgram(matched);
      if (matched) setSelectedProgram(matched);
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
