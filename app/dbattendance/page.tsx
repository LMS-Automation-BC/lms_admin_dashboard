"use client";
import React, { useEffect, useState } from "react";
import styles from "./AttendanceFilter.module.css"; // CSS Modules
import ReportButton from "./ReportButton";
import FastSelect from "./FastSelect";

export interface AttendanceRecord {
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

  const [pendingFilters, setPendingFilters] = useState(filters);

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const [pageSize, setPageSize] = useState(20); // default 10

  const handlePageSizeChange = (e: any) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // reset to first page after changing size
  };
  // Fetch date range options from backend
  useEffect(() => {
    const params = new URLSearchParams({ type: "options" });
    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/attendance?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        const format = (d: string) => d.split("T")[0];
        const start = format(data.startDate);
        const end = format(data.endDate);

        const initial = { ...filters, start, end };

        setDateRange({ start, end });
        setFilters(initial);
        setPendingFilters(initial);

        setCourseOptions(data.courses || []);
        setNameOptions(data.students || []);

        // Load data once filters are initialized
        getAttendance(initial);

        // setLoading(false);
      })
      .catch(console.error);
  }, []);
  const nameOptionsFormatted = [
    { value: "", label: "All Students" },
    ...nameOptions.map((n) => ({ value: n, label: n })),
  ];
  const handleSearch = () => {
    setFilters(pendingFilters);
    getAttendance(pendingFilters);
  };

  // Fetch attendance data & dropdown options whenever filters or page change
  const getAttendance = (activeFilters = filters) => {
    if (!activeFilters.start || !activeFilters.end) return;
    const params = new URLSearchParams({
      type: "data",
      start: activeFilters.start,
      end: activeFilters.end,
      course: activeFilters.course || "",
      name: activeFilters.name || "",
      absentOnly: activeFilters.absentOnly ? "true" : "false",
      page: currentPage.toString(),
      limit: pageSize.toString(),
    });

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/attendance?${params}`
    )
      .then((res) => res.json())
      .then((response) => {
        setAttendanceData(response.data);
        setTotalPages(response.totalPages);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    getAttendance();
  }, [currentPage, pageSize]);

  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.title}>📋 Attendance Report</h2>

        <div className={styles.filterRow}>
          <label>
            Start Date:
            <input
              type="date"
              value={pendingFilters.start}
              min={dateRange.start}
              max={dateRange.end}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, start: e.target.value })
              }
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={pendingFilters.end}
              min={dateRange.start}
              max={dateRange.end}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, end: e.target.value })
              }
            />
          </label>
            <label>
            Student:
          <FastSelect
            value={pendingFilters.name}
            onChange={(val) =>
              setPendingFilters({ ...pendingFilters, name: val })
            }
            options={nameOptions}
            placeholder="All Students"
          />
       </label>
          <label>
            Course:
            <FastSelect
              style={{ width: "400px" }}
              value={pendingFilters.course}
              onChange={(val) =>
                setPendingFilters({ ...pendingFilters, course: val })
              }
              options={["", ...courseOptions]} // include empty option
              placeholder="All Courses"
            />
          </label>
        </div>
        <div className={styles.searchRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={pendingFilters.absentOnly}
              onChange={(e) =>
                setPendingFilters({
                  ...pendingFilters,
                  absentOnly: e.target.checked,
                })
              }
            />{" "}
            Show only absent students
          </label>
          <button className={styles.searchButton} onClick={handleSearch}>
            Search
          </button>
          <ReportButton />
        </div>
        {loading && (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>
        )}
        {!loading && (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  {/* <th>Student ID</th> */}
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
                        r.Attendance_Percentage !== "100%"
                          ? styles.absentRow
                          : ""
                      }
                    >
                      {/* <td>{r.Student_Id}</td> */}
                      <td>{r.Name}</td>
                      <td>
                        {r.Course_Id ? (
                          <a
                            className={styles.myLink}
                            href={
                              "https://brookescollege.neolms.com/teacher_attendance/show/" +
                              r.Course_Id
                            }
                            target="_blank"
                          >
                            {r.Course_Name}
                          </a>
                        ) : (
                          r.Course_Name
                        )}
                      </td>
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

              {/* PAGE SIZE DROPDOWN */}

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next ▶
              </button>
              <div className={styles.pageSizeSelector}>
                <span>Page size:</span>
                <select value={pageSize} onChange={handlePageSizeChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>{" "}
    </>
  );
}
