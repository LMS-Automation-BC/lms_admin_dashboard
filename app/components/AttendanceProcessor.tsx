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
  const [reloadKey, setReloadKey] = useState(0);
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
  const handleClassFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setClassDataFile(file);
    setReloadKey((k) => k + 1); // Force remount
  };
  const handleAttendanceFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setAttendanceFile(file);
    setReloadKey((k) => k + 1); // Force remount
  };
  function toDateOnly(dateStr?: string | Date | null): Date | null {
    if (!dateStr) return null;

    // If already a Date object
    if (dateStr instanceof Date) {
      return new Date(
        dateStr.getFullYear(),
        dateStr.getMonth(),
        dateStr.getDate()
      );
    }

    // If it's a string like "2025-08-20"
    if (typeof dateStr === "string") {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return null;

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);

      return new Date(year, month, day);
    }

    return null; // fallback if format is unexpected
  }

  const filteredData = useMemo(() => {
    setIsProcessing(true);
    const data = combinedData.filter((row) => {
      const rowDate = toDateOnly(row.date); // normalized date

      if (filters && filters.startDate && filters.endDate) {
        const rowDate = toDateOnly(row.date);
        const startDate = toDateOnly(filters?.startDate);
        const endDate = toDateOnly(filters?.endDate);
        if (
          (startDate && rowDate && rowDate < startDate) ||
          (endDate && rowDate && rowDate > endDate)
        ) {
          return false;
        }
      }

      if (filters.selectedName && row.name !== filters.selectedName)
        return false;
      if (filters.selectedCourse && row.course_name !== filters.selectedCourse)
        return false;
      if (filters.showAbsentOnly && row.attendance !== "0%") return false;
      return true;
    });
    setIsProcessing(false);
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
          <input type="file" accept=".csv" onChange={handleClassFileChange} />
        </div>

        <div className="upload-group">
          <label>📝 Attendance Report</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleAttendanceFileChange}
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
