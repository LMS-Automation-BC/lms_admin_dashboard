'use client';
import React, { useEffect, useState } from "react";
import styles from "./AttendanceFilter.module.css"; // CSS Modules
import ReportButton from "./ReportButton";

interface AttendanceRecord {
  Id: number;
  Student_Id: string;
  Name: string | null;
  Course_Name: string | null;
  Attendance_Date: string | null;
  Attendance_Notes: string | null;
  Attendance_Percentage: string | null;
  Course_Id: string | null;
  Email: string | null;
}

interface DateRange {
  start: string;
  end: string;
}

export default function AttendanceReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    course: "",
    name: "",
    absentOnly: false,
  });

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch date range options from backend
  useEffect(() => {
     const params = new URLSearchParams({
      type:"options"})
      setLoading(true)
    fetch(`https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/attendance?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        
        const formatDate = (d: string) => d.split("T")[0]; // extract YYYY-MM-DD
        const start = formatDate(data.startDate);
        const end = formatDate(data.endDate);

        setDateRange({ start, end });
        setFilters((f) => ({ ...f, start, end }));

        // Set course and student options
        setCourseOptions(data.courses || []);
        setNameOptions(data.students || []);
        setLoading(false)
      })
      .catch(console.error);
  }, []);

  // Fetch attendance data & dropdown options whenever filters or page change
  useEffect(() => {
    if (!filters.start || !filters.end) return;

    const params = new URLSearchParams({
      type:"data",
      start: filters.start,
      end: filters.end,
      course: filters.course || "",
      name: filters.name || "",
      absentOnly: filters.absentOnly ? "true" : "false",
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    });
    setLoading(true)
    // Fetch paginated attendance
    fetch(`https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/attendance?${params.toString()}`)
      .then((res) => res.json())
      .then((response: any) => {
        setAttendanceData(response.data);
        setTotalPages(response.totalPages);
        setLoading(false)
      })
      .catch(console.error);
      
    const paramsCurrent = new URLSearchParams({
      type:"options",
      start: filters.start,
    end:filters.end});
    // Fetch dropdown options for current date range
    setLoading(true)
    fetch(
      `https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/attendance?${paramsCurrent.toString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        setCourseOptions(data.courses);
        setNameOptions(data.students);
        setLoading(false)
      })
      .catch(console.error);
  }, [filters, currentPage]);

  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
    if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📋 Attendance Report</h2>
     <ReportButton  />
      <div className={styles.filterRow}>
        <label>
          Start Date:
          <input
            type="date"
            value={filters.start}
            min={dateRange.start}
            max={dateRange.end}
            onChange={(e) => setFilters({ ...filters, start: e.target.value })}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={filters.end}
            min={dateRange.start}
            max={dateRange.end}
            onChange={(e) => setFilters({ ...filters, end: e.target.value })}
          />
        </label>

        <label>
          Course:
          <select
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          >
            <option value="">All Courses</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Student:
          <select
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          >
            <option value="">All Students</option>
            {nameOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.checkboxRow}>
        <label>
          <input
            type="checkbox"
            checked={filters.absentOnly}
            onChange={(e) =>
              setFilters({ ...filters, absentOnly: e.target.checked })
            }
          />{" "}
          Show only absent students
        </label>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Date</th>
            <th>Percentage</th>
            <th>Notes</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length > 0 ? (
            attendanceData.map((r) => (
              <tr
                key={r.Id}
                className={
                  r.Attendance_Percentage !== "100%" ? styles.absentRow : ""
                }
              >
                <td>{r.Student_Id}</td>
                <td>{r.Name}</td>
                <td>{r.Course_Name}</td>
                <td>{r.Attendance_Date?.split("T")[0]}</td>
                <td>{r.Attendance_Percentage}</td>
                <td>{r.Attendance_Notes}</td>
                <td>{r.Email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button onClick={handlePrev} disabled={currentPage === 1}>
          ◀ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next ▶
        </button>
      </div>
    </div>
  );
}
