"use client";
import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import "./CsvCombiner.css"; // Optional custom styles
import AttendanceTable from "./AttendanceTable";
import AttendanceFilters from "./AttendanceFilters";

const CsvCombiner = () => {
  const [classDataFile, setClassDataFile] = useState<File | null>(null);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<{
    startDate: string | null;
    endDate: string | null;
    selectedName: string | null;
    selectedCourse: string | null;
    showAbsentOnly: boolean;
  }>({
    startDate: null,
    endDate: null,
    selectedName: null,
    selectedCourse: null,
    showAbsentOnly: false,
  });
  const filteredData = useMemo(() => {
    console.log("filter memeo triggerd");
    const data = combinedData.filter((row) => {
      if (filters.startDate && new Date(row.date) < new Date(filters.startDate))
        return false;
      if (filters.endDate && new Date(row.date) > new Date(filters.endDate))
        return false;
      if (filters.selectedName && row.name !== filters.selectedName)
        return false;
      if (filters.selectedCourse && row.course_name !== filters.selectedCourse)
        return false;
      if (filters.showAbsentOnly && row.attendance !== "0%") return false;
      return true;
    });
    return data;
  }, [combinedData, filters]);

  

  const handleProcess = async () => {
    if (!classDataFile || !attendanceFile) {
      alert("Please upload all 2 CSVs before processing.");
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("classData", classDataFile);
    formData.append("attendance", attendanceFile);

    try {
      const response = await fetch("/api/process-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
console.log(data);
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setCombinedData(data); // Now coming from API
    } catch (err) {
      console.error("Error:", err);
      alert("Processing failed. See console for details.");
    } finally {
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

        <button
          className="process-btn"
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? "⏳ Processing..." : "📊 Process"}
        </button>
      </div>
      <AttendanceFilters data={combinedData} onFilterChange={setFilters} />
      <AttendanceTable data={filteredData} />
    </div>
  );
};

export default CsvCombiner;
