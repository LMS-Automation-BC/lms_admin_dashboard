"use client";
import React, { useState, useMemo } from "react";
import "./csvUpload.css";

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
  // add other fields returned by your API
}

interface GroupedData {
  Name: string;
  ID: string;
  AbsentDates: string[];
  userInfo?: ApiUserInfo;
  Course?: string; // extra API data per ID
}

const parseCsv = (text: string): CsvRow[] => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: any = {};
    headers.forEach((header, i) => {
      if (header.trim() === "Course Name") {
        row.Course = values[i];
      } else {
        row[header.trim()] = values[i]?.trim() ?? "";
      }
    });
    return row as CsvRow;
  });
  return rows;
};

const isDateInLast5Days = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
};

const fetchUserInfo = async (id: string): Promise<ApiUserInfo | null> => {
  try {
    const response = await fetch(`/api/lms?userId=${id}`);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return data as ApiUserInfo;
  } catch (err) {
    console.error(`Failed to fetch user info for ID ${id}`, err);
    return null;
  }
};

const CsvUpload: React.FC = () => {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") {
        setLoading(false);
        return;
      }

      const rows = parseCsv(text);

      const filtered = rows.filter((row) => {
        const percentageNum = parseFloat(row.Percentage.replace("%", ""));
        return percentageNum === 0 && isDateInLast5Days(row.Date);
      });

      // Group by Name + ID
      const groupedMap = new Map<string, GroupedData>();
      filtered.forEach(({ Name, ID, Date, Course }) => {
        const key = `${Name}-${ID}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { Name, ID, AbsentDates: [], Course }); // <-- assign Course here
        }
        groupedMap.get(key)!.AbsentDates.push(Date);
      });

      // Convert map to array
      const groupedArray = Array.from(groupedMap.values());

      // For each group, fetch user info API by ID
      const userCache = new Map<string, ApiUserInfo>();
      const withUserInfo: GroupedData[] = [];

      for (const group of groupedArray) {
        let userInfo = userCache.get(group.ID);

        if (!userInfo) {
          userInfo = (await fetchUserInfo(group.ID)) || undefined; 
          if (userInfo) {
            userCache.set(group.ID, userInfo); // ✅ cache it
          }
        }

        withUserInfo.push({ ...group, userInfo: userInfo ?? undefined });
      }

      setGroupedData(withUserInfo);
      setSelectedDate(null);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  // Unique dates
  const uniqueDates = useMemo(() => {
    const dateSet = new Set<string>();
    groupedData.forEach(({ AbsentDates }) => {
      AbsentDates.forEach((date) => dateSet.add(date));
    });
    return Array.from(dateSet).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedData]);

  // Filter groupedData by selectedDate if any
  const filteredData = useMemo(() => {
    if (!selectedDate) return groupedData;
    return groupedData.filter((item) =>
      item.AbsentDates.includes(selectedDate)
    );
  }, [groupedData, selectedDate]);

  return (
    <div className="container">
      <h2>Upload CSV (Name, ID, Date, Percentage)</h2>
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

      {loading && <p>Loading user info...</p>}

      {groupedData.length > 0 && (
        <>
          <p>
            <strong>Total Rows: {filteredData.length}</strong>
          </p>
          <div className="date-filters">
            <button
              className={`date-filter-btn ${
                selectedDate === null ? "active" : ""
              }`}
              onClick={() => setSelectedDate(null)}
            >
              All Dates
            </button>
            {uniqueDates.map((date) => (
              <button
                key={date}
                className={`date-filter-btn ${
                  selectedDate === date ? "active" : ""
                }`}
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </button>
            ))}
          </div>
          <button
            className="upload-label"
            style={{ marginBottom: "15px" }}
            onClick={() => exportToCsv(filteredData)}
            disabled={filteredData.length === 0}
          >
            Export CSV
          </button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>AbsentDates</th>
                <th>User Email</th>
                <th>Course Name</th>
                {/* example extra info from API */}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(
                ({ Name, ID, AbsentDates, userInfo, Course }) => (
                  <tr key={`${Name}-${ID}`}>
                    <td className={AbsentDates.length > 5 ? "red-text" : ""}>
                      {Name}
                    </td>
                    <td className={AbsentDates.length > 5 ? "red-text" : ""}>
                      {ID}
                    </td>
                    <td className={AbsentDates.length > 5 ? "red-text" : ""}>
                      {AbsentDates.join(", \n ")}
                    </td>
                    <td className={AbsentDates.length > 5 ? "red-text" : ""}>
                      {userInfo?.email ?? "—"}
                    </td>
                    <td className={AbsentDates.length > 5 ? "red-text" : ""}>
                      {Course}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CsvUpload;
const exportToCsv = (data: GroupedData[]) => {
  if (data.length === 0) return;

  // CSV header
  const headers = ["Name", "ID", "AbsentDates", "User Email", "Course"];

  // Build CSV rows
  const rows = data.map(({ Name, ID, AbsentDates, userInfo, Course }) => [
    `"${Name.replace(/"/g, '""')}"`,
    `"${ID.replace(/"/g, '""')}"`,
    `"${AbsentDates.join("; ").replace(/"/g, '""')}"`,
    `"${userInfo?.email?.replace(/"/g, '""') ?? ""}"`,
    `"${Course?.replace(/"/g, '""') ?? ""}"`,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "exported_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getDistinctCourses = (rows: CsvRow[]): string[] => {
  const courseSet = new Set<string>();
  rows.forEach((row) => {
    if (row.Course) {
      courseSet.add(row.Course);
    }
  });
  return Array.from(courseSet);
};
