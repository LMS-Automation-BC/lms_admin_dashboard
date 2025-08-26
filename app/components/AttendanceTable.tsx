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
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
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
      setSelectedIds(new Set(data.map((row) => row.id)));
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

  const handleSubmit = async () => {
    const selectedRows = data.filter((row) => selectedIds.has(row.id));
    const courseDateMap = new Map<
      string,
      { minDate: string; maxDate: string }
    >();
    selectedRows.forEach(({ course_id, date }) => {
      if (!courseDateMap.has(course_id)) {
        courseDateMap.set(course_id, { minDate: date, maxDate: date });
      } else {
        const current = courseDateMap.get(course_id)!;
        if (new Date(date) < new Date(current.minDate)) current.minDate = date;
        if (new Date(date) > new Date(current.maxDate)) current.maxDate = date;
      }
    });
     setIsLoading(true);
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
         setIsLoading(false);
      } else {
        const result = await response.json();
        console.log(`Success for course ${course_id}:`, result);
         setIsLoading(false);
      }
    }
  };

  return (
    <div className="table-wrapper">
      {selectedIds.size > 0 && (
        <div className="mb-2">
          <button className="submit-btn" onClick={handleSubmit}>
            Get attendance
          </button>
        </div>
      )}
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
              <th>Date</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isChecked = selectedIds.has(row.id);
              return (
                <tr key={`${row.id}-${index}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>
                  <td>{row.name}</td>
                  <td>{row.course_name}</td>
                  <td>{row.email}</td>
                  <td>{row.date}</td>
                  <td>{row.attendance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
