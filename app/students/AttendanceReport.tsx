import React, { useRef, useState } from "react";
import styles from "./AttendanceReport.module.css";
import { AttendanceRecord } from "../dbattendance/page";
import { useReactToPrint } from "react-to-print";
import { FiTrash2 } from "react-icons/fi";

interface AttendanceReportProps {
  data: AttendanceRecord[];
  studentName: string;
  student_ID: string;
}

const AttendanceReport = React.forwardRef<
  HTMLDivElement,
  AttendanceReportProps
>(({ data, studentName, student_ID }, ref) => {
  const [tableData, setTableData] = useState(data);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,

    documentTitle: `${studentName}-Transcript`,
  });

  // 1. GROUP BY COURSE
  const groupByCourse = (records: AttendanceRecord[]) => {
    return records.reduce((acc: any, r) => {
      if (r.Course_Name && !acc[r.Course_Name]) acc[r.Course_Name] = [];
      r.Course_Name ? acc[r.Course_Name].push(r) : "";
      return acc;
    }, {});
  };

  const grouped = groupByCourse(tableData);

  // 2. FLATTEN FOR RENDERING
  const flattenRows = () => {
    const allRows: any[] = [];
    Object.entries(grouped).forEach(([courseName, records]: any) => {
      records.forEach((rec: AttendanceRecord) => {
        allRows.push({
          ...rec,
          courseName,
        });
      });
    });
    return allRows;
  };

  const allRows = flattenRows();

  // 3. CHUNK TABLE INTO 30 ROWS
  const chunkRows = (rows: any[], size = 30) => {
    const chunks: any[] = [];
    for (let i = 0; i < rows.length; i += size) {
      chunks.push(rows.slice(i, i + size));
    }
    return chunks;
  };

  const tables = chunkRows(allRows);

  // 4. DELETE HANDLERS
  const handleDeleteRow = (courseName: string, id: number) => {
    setTableData((prev) =>
      prev.filter((r) => !(r.Id === id && r.Course_Name === courseName))
    );
  };

  const handleDeleteCourse = (courseName: string) => {
    setTableData((prev) => prev.filter((r) => r.Course_Name !== courseName));
  };

  return (
    <>
      <button
        onClick={() => {
          reactToPrintFn();
        }}
        className="export-button"
      >
        Print
      </button>

      <div ref={transcriptRef} className={styles.printableContent}>
        {/* FINAL SINGLE-TABLE VIEW WITH CHUNK SPLITTING */}
        <div className={styles.transcriptContainer}>
          {tables.map((tableRows, tIndex) => {
            // compute how many rows per course in this chunk
            const courseCounts: any = {};
            tableRows.forEach((r: any) => {
              courseCounts[r.courseName] =
                (courseCounts[r.courseName] || 0) + 1;
            });

            const printedCourses = new Set();

            return (
              <>
                {" "}
                <div className="header">
                  <img
                    src="/brookes_college.png"
                    alt="Institution Logo"
                    className="logo"
                  />
                  <div className="vertical-line" />
                  <div className="institution-name-wrapper">
                    <div className="institution-name brookes">Brookes</div>
                    <div className="institution-name college">College</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.left}>
                    <strong>Student Name:</strong> {studentName}
                  </div>
                  <div className={styles.right}>
                    <strong>Enrollment No:</strong> {student_ID}
                  </div>
                </div>
                <table key={tIndex} className={styles.printTable}>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Date</th>
                      <th>Attendance %</th>
                      <th className={"no-print"}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tableRows.map((row: any) => {
                      const firstTime = !printedCourses.has(row.courseName);
                      if (firstTime) printedCourses.add(row.courseName);

                      return (
                        <tr key={row.Id}>
                          {firstTime && (
                            <td
                              rowSpan={courseCounts[row.courseName]}
                              className={styles.courseNameCell}
                            >
                              <div className={styles.courseCell}>
                                <span>{row.courseName}</span>

                                <button
                                  className={`${styles.deleteCourseBtn} no-print`}
                                  onClick={() =>
                                    handleDeleteCourse(row.courseName)
                                  }
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          )}

                          <td>{row.Attendance_Date?.split("T")[0]}</td>

                          <td>{row.Attendance_Percentage}</td>
                          <td className={"no-print"}>
                            <button
                              className={`${styles.deleteBtn} no-print`}
                              onClick={() =>
                                handleDeleteRow(row.courseName, row.Id)
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
});

export default AttendanceReport;
