"use client"; // If using Next.js app router

import React, { useEffect, useState } from "react";
import "./GradeParser.css";
import { v4 as uuidv4 } from "uuid";
import { getGrade } from "../grades/helpers/grade";
import { getMatchingProgram } from "../grades/helpers/courseList";
import Select from "react-select";
import GradeProgramMatch from "./GradeProgramMatch";
import { Course, CoursesMap, ProgramName } from "../grades/helpers/grades.type";
import GradeTranscript from "./GradeTranscript";

export interface CsvRow {
  [key: string]: any;
  "First name": string;
  "Last name": string;
  "Full Name": string;
  "Program Name": string;
  "Program Start Date": string;
  "Student ID": string;
  "Overall Class Name": string;
  Name: string;
  "Default Class Name": string;
  "Course code": string;
  Semester: string;
  Credits: number;
  "Percent%": number;
  Grade: string;
  "Enrolled at": string;
}

const GradeParser: React.FC = () => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [confirmedProgram, setConfirmedProgram] = useState<string | null>(null);
  const [filteredCsvData, setFilteredCsvData] = useState<CsvRow[]>([]);
  const [programs, setPrograms] = useState<CoursesMap>({});
  useEffect(() => {
    console.log("all changes");
    if (!confirmedProgram || !Array.isArray(programs[confirmedProgram])) {
      setFilteredCsvData(calculateGradePoint(csvData)); // fallback: show all if no match
      return;
    }

    const matchedCourses = programs[confirmedProgram];
    const filtered: typeof csvData = [];
    const otherCourses: typeof csvData = [];
    const sanitize = (str: string) =>
      str?.toLowerCase().replace(/\s+/g, " ").trim();
    matchedCourses.forEach((course) => {
      const matches = csvData.filter((row) => {
        const csvCode = row["Course code"];
        const csvName = sanitize(row["Overall Class Name"] || row["Name"]);
        const courseCode = course.courseCode;
        const courseName = sanitize(course.courseName);

        return (
          csvCode === courseCode ||
          csvName.includes(courseName) ||
          courseName.includes(csvName) // <-- added reverse match
        );
      });
      if (matches.length > 0) {
        matches.forEach((match) => {
          filtered.push({
            ...match,
            "Course code": match["Course code"] || course.courseCode,
            Credits: match["Credit"] || course.credits,
            "Default Class Name": course.courseName,
          });
        });
      }
    });

    setFilteredCsvData(filtered);
  }, [confirmedProgram, csvData, selectedUser]);
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    let sessionId = localStorage.getItem("sessionId") || uuidv4();
    formData.append("sessionId", sessionId);
    if (!localStorage.getItem("sessionId"))
      localStorage.setItem("sessionId", sessionId);
    try {
      const response = await fetch("/api/process-grades", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse CSV on the server.");
      }

      const json = await response.json();

      setUserList(json.users);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  const calculateGradePoint = (users: any[]) => {
    let processedusers = users.map((user: any) => {
      const percent = Number(user["Percent%"]) || 0;
      const credits = Number(user["Credits"]) || 0;
      const gradePoint = getGrade(user["Grade"])?.gpa || 0;

      const gpa = credits * gradePoint;
      user["Grade Point"] = gradePoint;

      return user;
    });
    return processedusers;
  };
  useEffect(() => {
    const checkSessionAndFetchUsers = async () => {
      const existingSessionId = localStorage.getItem("sessionId");

      if (existingSessionId) {
        const confirmReplace = window.confirm(
          "An existing session was found. Do you want to upload a new file or use the existing data?"
        );

        if (!confirmReplace) {
          // Use existing sessionId to get user list from Redis
          setIsLoading(true);
          try {
            const response = await fetch(
              `/api/process-grades?sessionId=${existingSessionId}`
            );
            if (!response.ok) throw new Error("Failed to fetch user list");

            const json = await response.json();
            setUserList(json.users); // Expecting array of { name, id }
          } catch (err: any) {
            console.error(err);
            setError("Could not load user list from existing session.");
          } finally {
            setIsLoading(false);
          }
        } else {
          // If they choose to replace, clear the localStorage
          localStorage.removeItem("sessionId");
        }
      }
    };

    checkSessionAndFetchUsers();
  }, []);
  // useEffect(() => {
  //   if (csvData.length > 0) {
  //     const matchedProgram = getMatchingProgram(programs, csvData);
  //   }
  //   setCsvData(calculateScores(csvData));
  // }, [csvData]);
  useEffect(() => {
    fetch("/api/programs")
      .then((res) => res.json())
      .then(setPrograms)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedUser) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/process-grades?id=${selectedUser.value}`
        );
        if (!response.ok) throw new Error("Failed to fetch student data");

        const json = await response.json();

        setCsvData(calculateGradePoint(json.student));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading student data");
      } finally {
        setIsLoading(false);
      }
    };
    console.log("selected user changed");
    fetchStudentData();
  }, [selectedUser]);
  useEffect(() => {
    setCsvData(calculateGradePoint(csvData));
    console.log("confirmed program change changed");
  }, [confirmedProgram]);

  return (
    <div className="App">
      {isLoading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Parsing grade file, please wait...</p>
        </div>
      )}

      <label htmlFor="csv-upload" className="file-upload-label">
        Upload Grade Report
      </label>
      <input
        type="file"
        id="csv-upload"
        accept=".csv"
        onChange={handleFileUpload}
      />

      {error && <div className="error">{error}</div>}
      {userList?.length > 0 && (
        <div className="student-select-wrapper" style={{ margin: "20px 0" }}>
          <div style={{ margin: "20px 0" }}>
            <label
              htmlFor="student-select"
              style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}
            >
              Select Student:
            </label>
            <Select
              id="student-select"
              options={userList.map((user: any) => ({
                value: user.id,
                label: user.name,
              }))}
              onChange={(selectedOption) => {
                setConfirmedProgram(null);
                setSelectedUser(selectedOption);
              }}
              placeholder="Search and select student..."
              isClearable
            />
          </div>
        </div>
      )}
      {csvData.length > 0 && selectedUser && (
        <GradeProgramMatch
          programs={programs}
          csvData={csvData}
          onProgramConfirm={(programName) => setConfirmedProgram(programName)}
        />
      )}
      {selectedUser && confirmedProgram && (
        <GradeTranscript
          studentName={selectedUser?.label}
          program={confirmedProgram}
          programStartDate={filteredCsvData[0]["Program Start Date"]}
          enrollmentNo={selectedUser?.value}
          printDate={new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          courses={filteredCsvData}
          selectedProgram={programs[confirmedProgram]}
        ></GradeTranscript>
      )}
    </div>
  );
};

export default GradeParser;
