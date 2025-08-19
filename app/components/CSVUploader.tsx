"use client";
import React, { useState, useMemo, useEffect } from "react";
import "./csvUpload.css";
import Select from "react-select";

interface CsvRow {
  Name: string;
  ID: string;
  Course: string;
  Date: string;
  Percentage: string;
}

interface ApiUserInfo {
  id: string;
  fullName: string;
  email: string;
}

interface GroupedData {
  Name: string;
  ID: string;
  Absences: { date: string; course: string }[];
  userInfo?: ApiUserInfo;
}

const parseCsv = (text: string): CsvRow[] => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  const rows = lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue; // Skip quotes
      }

      if (char === "," && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        // Replace comma with colon only if inside quotes
        current += insideQuotes && char === "," ? ":" : char;
      }
    }
    values.push(current.trim()); // push last cell

    const row: any = {};
    headers.forEach((header, i) => {
      const key = header.trim() === "Course Name" ? "Course" : header.trim();
      row[key] = values[i] ?? "";
    });

    return row as CsvRow;
  });

  return rows;
};

// const parseCsv = (text: string): CsvRow[] => {
//   const lines = text.trim().split("\n");
//   const headers = lines[0].split(",");
//   return lines.slice(1).map((line) => {
//     const values = line.split(",");
//     const row: any = {};
//     headers.forEach((header, i) => {
//       const key = header.trim();
//       row[key === "Course Name" ? "Course" : key] = values[i]?.trim() ?? "";
//     });
//     return row as CsvRow;
//   });
// };

const fetchUserInfo = async (id: string): Promise<ApiUserInfo | null> => {
  try {
    const response = await fetch(`/api/user?userId=${id}`);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return data as ApiUserInfo;
  } catch (err) {
    console.error(`Failed to fetch user info for ID ${id}`, err);
    return null;
  }
};

const PAGE_SIZE = 10;

const CsvUpload: React.FC = () => {
  const [rawCsvRows, setRawCsvRows] = useState<CsvRow[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Cache for user info by ID
  const userCache = useMemo(() => new Map<string, ApiUserInfo>(), []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;

      const rows = parseCsv(text);
      setRawCsvRows(rows);
      setStartDate(null);
      setEndDate(null);
      setGroupedData([]);
      setCurrentPage(1);
      userCache.clear();
      setDateError(null);
    };

    reader.readAsText(file);
  };

  // Unique dates from CSV
  const uniqueDates = useMemo(() => {
    const allDates = rawCsvRows
      .map((row) => row.Date.trim())
      .filter((dateStr) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
      });

    return Array.from(new Set(allDates)).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [rawCsvRows]);

  const dateOptions = uniqueDates.map((date) => ({
    value: date,
    label: date,
  }));

  // Filter CSV rows by selected date range (without userInfo)
  const filteredGroupedData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const from = new Date(startDate);
    const to = new Date(endDate);
    if (to < from) return [];

    // Filter rows based on criteria
    const filteredRows = rawCsvRows.filter((row) => {
      const percentageNum = parseFloat(row.Percentage.replace("%", ""));
      const rowDate = new Date(row.Date);
      return percentageNum === 0 && rowDate >= from && rowDate <= to;
    });

    // Group by Name + ID
    const groupedMap = new Map<string, GroupedData>();

    filteredRows.forEach(({ Name, ID, Date, Course }) => {
      const key = `${Name}-${ID}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, { Name, ID, Absences: [] });
      }
      groupedMap.get(key)!.Absences.push({ date: Date, course: Course });
    });

    return Array.from(groupedMap.values());
  }, [rawCsvRows, startDate, endDate]);

  // Current page's grouped data slice
  const pageCount = Math.ceil(filteredGroupedData.length / PAGE_SIZE);

  // Ensure currentPage is valid if filtered data changes
  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount || 1);
    }
  }, [pageCount, currentPage]);

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredGroupedData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredGroupedData, currentPage]);

  // State to hold user info for current page rows
  const [pagedUserInfo, setPagedUserInfo] = useState<Map<string, ApiUserInfo>>(
    new Map()
  );
  const [courseInfoMap, setCourseInfoMap] = useState<Map<string, any>>(
    new Map()
  );

  // Fetch user info only for current page IDs
  useEffect(() => {
    const fetchUsersForPage = async () => {
      setLoading(true);
      const newUserInfoMap = new Map<string, ApiUserInfo>();

      for (const group of currentPageData) {
        if (userCache.has(group.ID)) {
          newUserInfoMap.set(group.ID, userCache.get(group.ID)!);
        } else {
          const info = await fetchUserInfo(group.ID);
          if (info) {
            userCache.set(group.ID, info);
            newUserInfoMap.set(group.ID, info);
          }
        }
      }
      setPagedUserInfo(newUserInfoMap);
      setLoading(false);
    };

    if (currentPageData.length > 0) {
      fetchUsersForPage();
    } else {
      setPagedUserInfo(new Map());
    }
  }, [currentPageData, userCache]);
  useEffect(() => {
    const fetchCourseInfoForPage = async () => {
      const newCourseMap = new Map(courseInfoMap); // clone existing map

      const coursesToFetch = new Set<string>();
      for (const group of currentPageData) {
        for (const { course } of group.Absences) {
          if (course && !newCourseMap.has(course)) {
            coursesToFetch.add(course);
          }
        }
      }

      for (const course of coursesToFetch) {
        const info = await fetchCourseInfo(
          course,
          startDate || undefined,
          endDate || undefined
        );
        if (info) {
          newCourseMap.set(course, info);
        }
      }

      setCourseInfoMap(newCourseMap);
    };

    if (currentPageData.length > 0) {
      fetchCourseInfoForPage();
    }
  }, [currentPageData]);

  // Error checking for date
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        setDateError("End date cannot be earlier than start date.");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);

const exportToCsv = (data: GroupedData[]) => {
  if (data.length === 0) return;

  const headers = ["Name", "ID", "Email", "Date", "Course"];
  const rows: string[][] = [];

  data.forEach(({ Name, ID, Absences }) => {
    const email = userCache.get(ID)?.email ?? "";

    Absences.forEach(({ date, course }) => {
      rows.push([
        `"${Name.replace(/"/g, '""')}"`,
        `"${ID.replace(/"/g, '""')}"`,
        `"${email.replace(/"/g, '""')}"`,
        `"${date.replace(/"/g, '""')}"`,
        `"${course.replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "absences.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


  // Pagination controls
  const renderPagination = () => {
    if (pageCount <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pageCount; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={
            i === currentPage ? "pagination-btn active" : "pagination-btn"
          }
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Prev
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
          disabled={currentPage === pageCount}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="container">
      <h2>Upload CSV (Name, ID, Date, Percentage, Course)</h2>
      <label htmlFor="csv-upload" className="upload-label">
        Choose CSV File
      </label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={loading}
      />

      {rawCsvRows.length > 0 && (
        <div className="date-range-filter">
          <label>
            Start Date
            <Select
              options={dateOptions}
              value={startDate ? { value: startDate, label: startDate } : null}
              onChange={(selectedOption) =>
                setStartDate(selectedOption ? selectedOption.value : null)
              }
              isClearable
              placeholder="Select start date"
            />
          </label>

          <label>
            End Date
            <Select
              options={dateOptions}
              value={endDate ? { value: endDate, label: endDate } : null}
              onChange={(selectedOption) =>
                setEndDate(selectedOption ? selectedOption.value : null)
              }
              isClearable
              placeholder="Select end date"
            />
          </label>
        </div>
      )}
      {dateError && (
        <p style={{ color: "red", fontWeight: "600", marginTop: "10px" }}>
          {dateError}
        </p>
      )}
      {(!startDate || !endDate) && rawCsvRows.length > 0 && (
        <p style={{ color: "#888" }}>
          <em>Please select both start and end dates to view data.</em>
        </p>
      )}

      {startDate && endDate && !dateError && (
        <>
          {loading ? (
            <p>Loading user info...</p>
          ) : (
            <>
              <p>
                <strong>Total Rows: {filteredGroupedData.length}</strong> | Page{" "}
                {currentPage} of {pageCount}
              </p>

              <button
                className="upload-label"
                style={{ marginBottom: "15px" }}
                onClick={() =>
                  exportToCsv(
                    filteredGroupedData.map((group) => ({
                      ...group,
                      userInfo: userCache.get(group.ID),
                    }))
                  )
                }
                disabled={filteredGroupedData.length === 0}
              >
                Export CSV
              </button>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    
                    <th>User Email</th>
                    <th>AbsentDates</th>
                     <th>Course Name</th> 
                  </tr>
                </thead>
               <tbody>
  {currentPageData.map(({ Name, ID, Absences }) => {
    const email = pagedUserInfo.get(ID)?.email ?? "—";
    const isHighlighted = Absences.length >= 5;

    return Absences.map((absence, index) => (
      <tr key={`${ID}-${index}`}>
        {index === 0 && (
          <>
            <td rowSpan={Absences.length} className={isHighlighted ? "red-text" : ""}>
              {Name}
            </td>
            <td rowSpan={Absences.length} className={isHighlighted ? "red-text" : ""}>
              {ID}
            </td>
            <td rowSpan={Absences.length} className={isHighlighted ? "red-text" : ""}>
              {email}
            </td>
          </>
        )}
        <td>{absence.date}</td>
        <td>
          {absence.course}
          {/* {courseInfoMap.get(absence.course) && (
            <span className="course-info">
              {" "}— {courseInfoMap.get(absence.course).id}
            </span>
          )} */}
        </td>
      </tr>
    ));
  })}
</tbody>

              </table>

              {renderPagination()}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CsvUpload;
const fetchCourseInfo = async (
  courseName: string,
  startDate?: string,
  endDate?: string
): Promise<any> => {
  try {
    const res = await fetch(
      `/api/class?name=${encodeURIComponent(
        courseName
      )}&startDate=${startDate}&endDate=${endDate}`
    );
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch course info for "${courseName}"`, err);
    return null;
  }
};
