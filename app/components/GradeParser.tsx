"use client"; // If using Next.js app router

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [creditsEarned, setCreditsEarned] = useState<number>(0);
  const [cumulativeGpa, setCumulativeGpa] = useState<number>(0);
  const [confirmedProgram, setConfirmedProgram] = useState<string | null>(null);
  const [filteredCsvData, setFilteredCsvData] = useState<CsvRow[]>([]);
  const [programs, setPrograms] = useState<CoursesMap>({});
  useEffect(() => {
    if (!confirmedProgram || !Array.isArray(programs[confirmedProgram])) {
      setFilteredCsvData(calculateScores(csvData)); // fallback: show all if no match
      return;
    }

    const matchedCourses = programs[confirmedProgram];
    
    const filtered = csvData
      .map((row) => {
        const matchedCourse = matchedCourses.find(
          (course) =>
            course.courseCode === row["Course code"] ||
            row["Overall Class Name"]
              ?.toLowerCase()
              .includes(course.courseName.toLowerCase())
        );

        if (!matchedCourse) return null; // No match — exclude this row

        return {
          ...row,
          "Course code": row["Course code"] || matchedCourse.courseCode,
          Credits: row["Credit"] || matchedCourse.credits,
          "Default Class Name": matchedCourse.courseName,
        };
      })
      .filter((row): row is (typeof csvData)[number] => row !== null);
    setFilteredCsvData(filtered);
  }, [confirmedProgram, csvData,selectedUser]);
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
  const calculateScores = (users: any[]) => {
    let totalCredits = 0;
    let totalGPA = 0;
    let creditsEarned =0
    let processedusers = users.map((user: any) => {
      const percent = Number(user["Percent%"]) || 0;
      const credits = Number(user["Credits"]) || 0;
      const gradePoint = getGrade(percent)?.gpa || 0;

      const gpa = credits * gradePoint;
      user["Grade Point"] = gradePoint;
      if(gradePoint!=0 )creditsEarned += credits;
      totalGPA += gpa;
      totalCredits +=credits
      return user;
    });
    setTotalCredits(totalCredits);
    setCumulativeGpa(totalGPA / totalCredits);
    setCreditsEarned(creditsEarned);
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
  useEffect(() => {
    if (csvData.length > 0) {
      const matchedProgram = getMatchingProgram(programs,csvData);
    }
  }, [csvData]);
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
        setCumulativeGpa(0);
        setCreditsEarned(0);
        setTotalCredits(0);
        setCsvData(calculateScores(json.student));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [selectedUser]);


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
      {csvData.length > 0  && (
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
          programStartDate="September 1, 2021"
          enrollmentNo={selectedUser?.value}
          credits={creditsEarned}
          cumulativeGpa={cumulativeGpa}
          totalCredits = {totalCredits}
          printDate={new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          courses={filteredCsvData}
        ></GradeTranscript>
      )}
    </div>
  );
};

export default GradeParser;
