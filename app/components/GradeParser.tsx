"use client"; // If using Next.js app router

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./GradeParser.css";
import { v4 as uuidv4 } from "uuid";
import { getGrade } from "../grades/helpers/grade";
import { getMatchingProgram } from "../grades/helpers/courseList";

export interface CsvRow {
  [key: string]: any;
  "First name": string;
  "Last name": string;
  "Full Name": string;
  "Program Name": string;
  "Program Start Date": string;
  "Student ID": string;
  "Overall Class Name": string;
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [creditsEarned, setCreditsEarned] = useState<number>(0);
  const [cumulativeGpa, setCumulativeGpa] = useState<number>(0);
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

      console.log(JSON.stringify(json.users));
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
    let processedusers = users.map((user: any) => {
      const percent = Number(user["Percent%"]) || 0;
      const credits = Number(user["Credits"]) || 0;
      const gradePoint = getGrade(percent)?.gpa || 0;

      const gpa = credits * gradePoint;
      user['Grade Point'] = gradePoint;
      totalCredits += credits;
      totalGPA += gpa;

      return user;
    });
    setCumulativeGpa(totalGPA/totalCredits);
    setCreditsEarned(totalCredits);
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
      const matchedProgram = getMatchingProgram(csvData);
      console.log("Student Program:", matchedProgram);
    }
  }, [csvData]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedUser) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/process-grades?id=${selectedUser}`);
        if (!response.ok) throw new Error("Failed to fetch student data");

        const json = await response.json();
        setCumulativeGpa(0);
        setCreditsEarned(0);
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Course Code",
      "Course Name",
      "Credits",
      "Percent%",
      "Grade",
    ];
    const tableRows = csvData.map((row) => [
      row["Course code"],
      row["Overall Class Name"],
      row["Credits"],
      row["Percent%"],
      row["Grade"],
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
      margin: { top: 20 },
    });

    doc.save("courses.pdf");
  };

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
        <div style={{ margin: "20px 0" }}>
          <label htmlFor="user-search" style={{ fontWeight: 600 }}>
            Select Student:
          </label>
          <input
            id="user-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            className="user-search-input"
          />
          <select
            className="user-select"
            value={selectedUser ?? ""}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select a student --</option>
            {userList
              .filter((user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user, index) => (
                <option key={index} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
        </div>
      )}
      {csvData.length > 0 && (
        <>
          <table className="grade-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Last Attempt</th>
                <th>Credits</th>
                <th>Letter Grade</th>
                <th> Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  <td>{row["Course code"]}</td>
                  <td>{row["Overall Class Name"]}</td>
                  <td>
                    {row["Overall Class Name"].split(" - ").slice(-1)[0].trim()}
                  </td>
                  <td>{row["Credits"]}</td>
                  <td>{row["Grade"]}</td>
                  <td>
                    {row["Grade Point"]}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4}  style={{ textAlign: 'right' }}> Credits Earned</td>
                <td colSpan={2}> {creditsEarned}</td>
              </tr>
              <tr>
                <td colSpan={4}  style={{ textAlign: 'right' }}>Total Credits</td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td colSpan={4}  style={{ textAlign: 'right' }}>Cumulative Grade Point Average(CGPA)</td>
                <td colSpan={2}>{cumulativeGpa}</td>
              </tr>
              <tr>
                <td colSpan={4}  style={{ textAlign: 'right' }}>Program Status</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>

          <button className="export-btn" onClick={exportToPDF}>
            Export to PDF
          </button>
        </>
      )}
    </div>
  );
};

export default GradeParser;
