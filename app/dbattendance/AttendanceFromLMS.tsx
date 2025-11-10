import React, { useState, useEffect } from "react";
import styles from "./AttendanceReport.module.css";

export default function AttendanceFromLMS() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [progress, setProgress] = useState(0);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const startReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3001/api/attendance/run-report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start: startDate, end: endDate }),
        }
      );
      const data = await res.json();
      setJobId(data.jobId);
      setStatus("pending");
      setProgress(0);
    } catch (err) {
      console.error(err);
      alert("Failed to start report");
    }
    setLoading(false);
  };

  // Polling the status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/attendance/report-status/${jobId}`
        );
        const data = await res.json();
        setStatus(data.status);

        if (data.status === "completed"|| data.status === "failed") {
          setReportData(data.reportData || []);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      }
    }, 2000); // poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📋 Attendance Report</h2>

      <div className={styles.filters}>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={startReport} disabled={loading}>
          {loading ? "Starting..." : "Get Reports"}
        </button>
      </div>

      {status && <p>Status: {status}</p>}

      {reportData.length > 0 && (
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
            {reportData.map((r) => (
              <tr key={r.Id}>
                <td>{r.Student_Id}</td>
                <td>{r.Name}</td>
                <td>{r.Course_Name}</td>
                <td>{r.Attendance_Date?.split("T")[0]}</td>
                <td>{r.Attendance_Percentage}</td>
                <td>{r.Attendance_Notes}</td>
                <td>{r.Email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
