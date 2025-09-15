"use client";
import React, { useEffect, useRef, useState } from "react";
import "./attendanceTable.css";

type CombinedAttendance = {
  course_id: string;
  id: string;
  name: string;
  course_name: string;
  email: string;
  date: string;
  attendance: string;
};

interface AttendanceTableProps {
  data: CombinedAttendance[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceNotes, setAttendanceNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // Toggle sort direction on click
  const handleDateSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });
  const toggleSelect = (id: string, course_id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id + course_id)) {
        newSet.delete(id + course_id);
      } else {
        newSet.add(id + course_id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      // All selected, unselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(data.map((row) => row.id + row.course_id)));
    }
  };
  useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);
  useEffect(() => {
    if (!selectAllRef.current) return;
    const isIndeterminate =
      selectedIds.size > 0 && selectedIds.size < data.length;
    selectAllRef.current.indeterminate = isIndeterminate;
  }, [selectedIds, data.length]);
  if (!data.length) {
    return <p>No attendance data to display.</p>;
  }
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ["Name", "Course Name", "Email", "Date", "Attendance"];

    const csvRows = [
      headers.join(","), // CSV header row
      ...data.map((row) =>
        [
          row.name,
          row.course_name,
          row.email,
          row.date,
          row.attendance == "0%" ? "Absent" : "Present",
        ]
          .map((val) => `"${val}"`) // wrap in quotes to escape commas
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Report.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      alert("select students to get attendance");
    } else {
      const selectedRows = data.filter((row) =>
        selectedIds.has(row.id + row.course_id)
      );
      const courseDateMap = new Map<
        string,
        { minDate: string; maxDate: string }
      >();
      selectedRows.forEach(({ course_id, date }) => {
        if (!courseDateMap.has(course_id)) {
          courseDateMap.set(course_id, { minDate: date, maxDate: date });
        } else {
          const current = courseDateMap.get(course_id)!;
          if (new Date(date) < new Date(current.minDate))
            current.minDate = date;
          if (new Date(date) > new Date(current.maxDate))
            current.maxDate = date;
        }
      });
      setIsLoading(true);
      const allNotes: any = [];
      // Now make one API call per distinct course_id with min/max dates
      for (const [course_id, { minDate, maxDate }] of courseDateMap) {
        const response = await fetch(
          `/api/class?classId=${course_id}&startDate=${minDate}&endDate=${maxDate}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          console.error(
            `Failed to fetch course ${course_id}: ${response.statusText}`
          );
          continue;
        } else {
          const result = await response.json();
          result.forEach((session: any) => {
            session.attendance.forEach((att: any) => {
              const rowId = att.user_id + course_id;

              if (selectedIds.has(rowId)) {
                const matchedStudent = selectedRows.find(
                  (x) => x.id + x.course_id === rowId
                );
                allNotes.push({
                  email: matchedStudent?.email ?? "",
                  name: matchedStudent?.name ?? "",
                  sessionDate: session.sessionDate,
                  userId: att.user_id,
                  status: att.status,
                  note: att.note ?? "",
                  course: selectedRows.find((x) => x.id + x.course_id === rowId)
                    ?.course_name,
                });
              }
            });
          });
        }
      }
      setIsLoading(false);
      setAttendanceNotes(allNotes);
      setShowModal(true); //
    }
  };
  const exportNotesToExcel = () => {
    if (attendanceNotes.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Session Date",
      "Status",
      "Note",
      "Course",
    ];
    const rows = attendanceNotes.map((note: any) => [
      note.name,
      note.email,
      new Date(note.sessionDate).toLocaleDateString(),
      note.status,
      note.note,
      note.course,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance_notes.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  // Count appearances of each student by their ID
const studentAbsenceDates = data.reduce((acc, row) => {
  if (row.attendance === "0%") {
    if (!acc[row.id]) {
      acc[row.id] = new Set<string>();
    }
    acc[row.id].add(row.date); // Make sure Date is a string or consistently formatted
  }
  return acc;
}, {} as Record<string, Set<string>>);


  return (
    <div className="table-wrapper">
      <div className="mb-2" style={{ display: "flex", gap: "10px" }}>
        <button className="submit-btn" onClick={handleSubmit}>
          Get attendance
        </button>
        <button className="submit-btn" onClick={exportToCSV}>
          Export to CSV
        </button>
      </div>
      <div style={{ color: "blue" }}>
        Select Students and click Get Attendance to get detailed Attendance Data
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-dark">
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedIds.size === data.length}
                />
              </th>
              <th>Name</th>
              <th>Course Name</th>
              <th>Email</th>
              <th style={{ cursor: "pointer" }} onClick={handleDateSort}>
        Date {sortDirection === "asc" ? "⬆️" : "⬇️"}
      </th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const isOverLimit = studentAbsenceDates[row.id]?.size > 5;

              const isChecked = selectedIds.has(row.id + row.course_id);
              return (
                <tr key={`${row.id}-${index}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(row.id, row.course_id)}
                    />
                  </td>
                  <td
                    style={{
                      color:
                        isOverLimit && row.attendance === "0%"
                          ? "red"
                          : "black",
                    }}
                  >
                    {row.name}
                  </td>
                  <td>
                    {row.course_name}-{row.course_id}
                  </td>
                  <td>{row.email}</td>
                  <td>{row.date}</td>
                  <td>
                    {row.attendance === "100%" ? (
                      <>
                        ✅ <span>Present</span>
                      </>
                    ) : row.attendance === "0%" ? (
                      <>
                        ❌ <span>Absent</span>
                      </>
                    ) : (
                      <>
                        ⏳ <span>{row.attendance}</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Attendance Notes</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Session Date</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>CourseName</th>
                </tr>
              </thead>
              <tbody>
                {attendanceNotes.map((note: any, index) => (
                  <tr key={index}>
                    <td>{note.name}</td>
                    <td>{note.email}</td>
                    <td>{new Date(note.sessionDate).toLocaleDateString()}</td>
                    <td>{note.status}</td>
                    <td>{note.note}</td>
                    <td>{note.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="d-flex justify-content-end gap-2 mt-3"
              style={{ display: "flex", gap: "10px" }}
            >
              <button
                onClick={exportNotesToExcel}
                className="submit-btn"
                style={{ background: "#9f6417ff" }}
              >
                Export to Excel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedIds(new Set());
                }}
                className="submit-btn"
                style={{ background: "#645ecfff" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
