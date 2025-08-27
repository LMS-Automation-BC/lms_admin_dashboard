"use client";
import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import "./CsvCombiner.css"; // Optional custom styles
import AttendanceTable from "./AttendanceTable";
import AttendanceFilters from "./AttendanceFilters";

const CsvCombiner = () => {
  const [classDataFile, setClassDataFile] = useState<File | null>(null);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [studentInfoFile, setStudentInfoFile] = useState<File | null>(null);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<{
    startDate: string | null;
    endDate: string | null;
    selectedName: string | null;
    selectedCourse: string | null;
    showAbsentOnly:boolean
  }>({
    startDate: null,
    endDate: null,
    selectedName: null,
    selectedCourse: null,
    showAbsentOnly:false
  });
  const filteredData = useMemo(() => {
    
    const data
    = combinedData.filter((row) => {
      if (filters.startDate && new Date(row.date) < new Date(filters.startDate))
        return false;
      if (filters.endDate && new Date(row.date) > new Date(filters.endDate))
        return false;
      if (filters.selectedName && row.name !== filters.selectedName)
        return false;
      if (filters.selectedCourse && row.course_name !== filters.selectedCourse)
        return false;
      if(filters.showAbsentOnly && row.attendance !== '0%')
        return false;
      return true;
    });
    return data;
  }, [combinedData, filters]);

  const parseCsv = (file: File): Promise<any[]> =>
    new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
      });
    });

  const handleProcess = async () => {
    if (!classDataFile || !attendanceFile || !studentInfoFile) {
      alert("Please upload all 3 CSVs before processing.");
      return;
    }
     setIsProcessing(true); // 
    try {
      const [classData, attendanceData, studentInfoData] = await Promise.all([
        parseCsv(classDataFile),
        parseCsv(attendanceFile),
        parseCsv(studentInfoFile),
      ]);
      const emailHeader = Object.keys(studentInfoData[0] || {}).find((key) =>
        key.toLowerCase().includes("email address")
      );
      const courseNameToLmsId = new Map(
        classData.map((c) => [c["Name"]?.trim(), c["LMS ID"]?.trim()])
      );

      let idToEmail = new Map<string, string>();
      if (emailHeader) {
        idToEmail = new Map(
          studentInfoData.map((s) => {
            const id = s["ID"]?.trim() || "";
            const email = s[emailHeader]?.trim() || "Email not found";
            return [id, email];
          })
        );
      } else {
        idToEmail = new Map(
          studentInfoData.map((s) => {
            const id = s["ID"]?.trim() || "";
            const email = "Email not found";
            return [id, email];
          })
        );
      }

      const result = attendanceData.map((row) => {
        const id = row["ID"]?.trim();
        const name = row["Name"]?.trim();
        const courseName = row["Course Name"]?.trim();
        const date = row["Date"]?.trim(); // <- add Date if available
        const attendance = row["Percentage"]?.trim();
        const course_id = courseNameToLmsId.get(courseName) || "Unknown LMS ID";
        const email = idToEmail.get(id) || "Email not found";

        return {
          course_id,
          id,
          name,
          course_name: courseName,
          email,
          date,
          attendance
        };
      });

      setCombinedData(result);
       setIsProcessing(false);
    } catch (error) {
      console.error("Error parsing files:", error);
       setIsProcessing(false);
    }
  };

  return (
    <div className="csv-uploader">
      <h2>Upload CSVs</h2>

      <div className="upload-row">
        <div className="upload-group">
          <label>📘 Class Data</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setClassDataFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="upload-group">
          <label>📝 Attendance Report</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setAttendanceFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="upload-group">
          <label>👤 Student Info</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setStudentInfoFile(e.target.files?.[0] || null)}
          />
        </div>

        <button className="process-btn" onClick={handleProcess}  disabled={isProcessing}>
         {isProcessing ? "⏳ Processing..." : "📊 Process"}
        </button>
      </div>
      <AttendanceFilters data={combinedData} onFilterChange={setFilters} />
      <AttendanceTable data={filteredData} />
    </div>
  );
};

export default CsvCombiner;
