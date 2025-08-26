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
  Absences: { date: string; course: string, note:string }[];
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
const parseUserCsv = (text: string): Map<string, ApiUserInfo> => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  const idIndex = headers.findIndex((h) => h.trim() === "ID");
  const nameIndex = headers.findIndex((h) => h.trim() === "First name");
  const emailIndex = headers.findIndex(
    (h) => h.trim().toLowerCase().indexOf("email") > -1
  );

  const map = new Map<string, ApiUserInfo>();
  lines.slice(1).forEach((line) => {
    const values = line.split(",");
    const id = values[idIndex]?.trim();
    const fullName = values[nameIndex]?.trim();
    const email = values[emailIndex]?.trim();

    if (id && fullName && email) {
      map.set(id, { id, fullName, email });
    }
  });
  return map;
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
  const [selectedStudent, setselectedStudent] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  // State to hold user info for current page rows
  const [pagedUserInfo, setPagedUserInfo] = useState<Map<string, ApiUserInfo>>(
    new Map()
  );
  const [courseInfoMap, setCourseInfoMap] = useState<Map<string, any>>(
    new Map()
  );

  const [courseInfoLoading, setCourseInfoLoading] = useState(false);
  const [uploadedUserData, setUploadedUserData] = useState<
    Map<string, ApiUserInfo>
  >(new Map());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Cache for user info by ID
  const userCache = useMemo(() => new Map<string, ApiUserInfo>(), []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const label = document.getElementById("csv-filename");
    if (label && file) label.textContent = file.name;

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;

      const rows = parseCsv(text);
      setRawCsvRows(rows);
      setStartDate(null);
      setEndDate(null);
      setselectedStudent(null);
      setCourseName(null);
      setGroupedData([]);
      setCurrentPage(1);
      userCache.clear();
      setDateError(null);
    };

    reader.readAsText(file);
  };
  const uniqueUsers = useMemo(() => {
    if (!startDate || !endDate) return [];

    const from = new Date(startDate);
    const to = new Date(endDate);

    const seen = new Set<string>();
    const users: { id: string; name: string }[] = [];

    rawCsvRows.forEach((row) => {
      const rowDate = new Date(row.Date);
      if (isNaN(rowDate.getTime()) || rowDate < from || rowDate > to) return;

      const id = row.ID.trim();
      const name = row.Name.trim();
      const key = `${id}-${name}`;

      if (!seen.has(key)) {
        seen.add(key);
        users.push({ id, name });
      }
    });

    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [rawCsvRows, startDate, endDate]);
  const uniqueCourseNames = useMemo(() => {
    if (!startDate) return [];
    if (!endDate) return [];
    const from = new Date(startDate);
    const to = new Date(endDate);
    const courses = rawCsvRows
      .filter((row) => {
        const rowDate = new Date(row.Date);
        return !isNaN(rowDate.getTime()) && rowDate >= from && rowDate <= to;
      })
      .map((row) => row.Course.trim())
      .filter(Boolean); // Remove empty strings

    return Array.from(new Set(courses)).sort((a, b) => a.localeCompare(b));
  }, [rawCsvRows, startDate, endDate]);
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
  const studentOptions = uniqueUsers.map((user) => ({
    value: user.name,
    label: user.name,
  }));
  const courseOptions = uniqueCourseNames.map((course) => ({
    value: course,
    label: course,
  }));

  // Filter CSV rows by selected date range (without userInfo)
  const filteredGroupedData = useMemo(() => {
    if (!startDate || !endDate) return [];

    const from = new Date(startDate);
    const to = new Date(endDate);
    if (to < from) return [];

    const filteredRows = rawCsvRows.filter((row) => {
      const percentageNum = parseFloat(row.Percentage.replace("%", ""));
      const rowDate = new Date(row.Date);

      // Check percentage and date range first
      const isAbsent = percentageNum === 0;
      const inDateRange = rowDate >= from && rowDate <= to;

      // Apply student filter if set
      const matchesStudent = selectedStudent
        ? row.Name.toLowerCase().includes(selectedStudent.toLowerCase())
        : true;

      // Apply course name filter if set
      const matchesCourse = courseName
        ? row.Course.toLowerCase().includes(courseName.toLowerCase())
        : true;

      return isAbsent && inDateRange && matchesStudent && matchesCourse;
    });

    const groupedMap = new Map<string, GroupedData>();
    filteredRows.forEach(({ Name, ID, Date, Course }) => {
      const key = `${Name}-${ID}`;
       // Try to find note from courseInfo
    let note = "—"; // Default if not found
      if (!courseInfoMap || courseInfoMap.size === 0) {
    note = "Loading...";
    } 
       const courseInfo = courseInfoMap.get(Course);
    
    if (courseInfo) {
      const matchedSession = courseInfo.find(
        (session: any) =>  session.sessionDate.indexOf( Date) > -1
      );

      const studentEntry = matchedSession?.attendance.find(
        (entry: any) =>
          entry.user_id?.toString() === ID || entry.id?.toString() === ID
      );

      note = studentEntry?.note || "no notes found";
    } else {
      note = "Course info not found (check LMS or report)";
    }
    if (!groupedMap.has(key)) {
        groupedMap.set(key, { Name, ID, Absences: [] });
    }
    groupedMap.get(key)!.Absences.push({
      date: Date,
      course: Course,
      note, // Embed note here
    });
  });

  return Array.from(groupedMap.values());
  }, [rawCsvRows, startDate, endDate, selectedStudent, courseName, courseInfoMap]);

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

  

  // Fetch user info only for current page IDs
  useEffect(() => {
    const fetchUsersForPage = async () => {
      setLoading(true);
      const newUserInfoMap = new Map<string, ApiUserInfo>();

      for (const group of currentPageData) {
        const cached = userCache.get(group.ID);
        if (cached) {
          newUserInfoMap.set(group.ID, cached);
        } else if (uploadedUserData.has(group.ID)) {
          const localInfo = uploadedUserData.get(group.ID)!;
          userCache.set(group.ID, localInfo);
          newUserInfoMap.set(group.ID, localInfo);
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
  }, [currentPageData, uploadedUserData, userCache]);
  useEffect(() => {
    const fetchCourseInfoForPage = async () => {
      setCourseInfoLoading(true);

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
      setCourseInfoLoading(false);
    };

    if (currentPageData.length > 0) {
      fetchCourseInfoForPage();
    }
  }, [currentPageData, startDate, endDate]);

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

    const headers = ["Name", "ID", "Email", "Date", "Course","Notes"];
    const rows: string[][] = [];

    data.forEach(({ Name, ID, Absences }) => {
      const email =
        uploadedUserData.get(ID)?.email ?? userCache.get(ID)?.email ?? "";

      Absences.forEach(({ date, course, note }) => {
        rows.push([
          `"${Name.replace(/"/g, '""')}"`,
          `"${ID.replace(/"/g, '""')}"`,
          `"${email.replace(/"/g, '""')}"`,
          `"${date.replace(/"/g, '""')}"`,
          `"${course.replace(/"/g, '""')}"`,
          `"${note.replace(/"/g, '""')}"`,
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

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
      <div className="upload-buttons">
        <div className="upload-group">
          <label htmlFor="csv-upload" className="upload-label">
            Choose Attendance CSV
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <span id="csv-filename" className="filename-label"></span>
        </div>
        <div className="upload-group">
          <label htmlFor="user-csv-upload" className="upload-label">
            Upload User Info CSV
          </label>
          <input
            id="user-csv-upload"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              const label = document.getElementById("user-filename");
              if (label) label.textContent = file?.name || "";
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (event) => {
                const text = event.target?.result;
                if (typeof text !== "string") return;

                const userMap = parseUserCsv(text);
                setUploadedUserData(userMap);
              };
              reader.readAsText(file);
            }}
            disabled={loading}
          />
          <span id="user-filename" className="filename-label"></span>
        </div>
      </div>

      {rawCsvRows.length > 0 && (
        <div>
          <div className="date-range-filter">
            <label>
              Start Date
              <Select
                options={dateOptions}
                value={
                  startDate ? { value: startDate, label: startDate } : null
                }
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
          <div className="name-filter">
            <label>
              Student Name
              <Select
                options={studentOptions}
                value={
                  selectedStudent
                    ? { value: selectedStudent, label: selectedStudent }
                    : null
                }
                onChange={(selectedOption) =>
                  setselectedStudent(
                    selectedOption ? selectedOption.value : null
                  )
                }
                isClearable
                placeholder="Select Student"
              />
            </label>

            <label>
              Course
              <Select
                options={courseOptions}
                value={
                  courseName ? { value: courseName, label: courseName } : null
                }
                onChange={(selectedOption) =>
                  setCourseName(selectedOption ? selectedOption.value : null)
                }
                isClearable
                placeholder="Select Course"
              />
            </label>
          </div>
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
                    <th>User Email</th>
                    <th>AbsentDates</th>
                    <th>Course Name</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map(({ Name, ID, Absences }) => {
                    const email = pagedUserInfo.get(ID)?.email ?? "—";
                    const isHighlighted = Absences.length >= 5;

                    return Absences.map((absence, index) => (
                      <tr key={`${ID}-${absence.date}-${index}`}>
                        <td className={isHighlighted ? "red-text" : ""}>
                          {Name}
                        </td>
                        <td className={isHighlighted ? "red-text" : ""}>
                          {email}
                        </td>
                        <td>{absence.date}</td>
                        <td>{absence.course}</td>
                        <td>
                          {absence.note}
                          {/* {courseInfoLoading ? (
                            <span style={{ color: "#aaa" }}>Loading...</span>
                          ) : (
                            (() => {
                              const courseInfo = courseInfoMap.get(
                                absence.course
                              );
                              if(!courseInfo){
                                return 'Course info not found check name on lms or report'
                              }
                              const attendanceList = courseInfo?.filter(
                                (x: any) => {
                                  
                                   return x.sessionDate.indexOf( absence.date) > -1;
                                }
                              );
                              
                              if(!courseInfo){
                                return 'could not find session'
                              }
                              const studentEntry =
                                attendanceList?.[0]?.attendance.filter(
                                  (entry: any) =>{
                                    return entry.user_id.toString() === ID || entry.id.toString() === ID
                                  }
                                );
                                
                              if(!studentEntry){
                                return 'could not find student in session'
                              }
                              //return studentEntry?.note || "—";
                              return studentEntry[0].note || 'no notes found';
                            })()
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
      `/api/class?name=${courseName}&startDate=${startDate}&endDate=${endDate}`
    );
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch course info for "${courseName}"`, err);
    return null;
  }
};
