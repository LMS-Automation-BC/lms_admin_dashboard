import React, { useRef } from "react";
import styles from "./GradeReport.module.css";
import "./transcripts/GradeTranscript.css";
import { useReactToPrint } from "react-to-print";
export interface Course {
  Enrolled_At: string;
  Course_Name: string;
  Course_Code: string;
  Grade: string;
  Percentage: number;
}

interface GradeReportProps {
  courses: Course[];
  studentName: string;
  student_ID: string;
}

const GradeReport: React.FC<GradeReportProps> = ({
  courses,
  studentName,
  student_ID,
}) => {
  if (!courses || courses.length === 0) {
    return <p>No course data available.</p>;
  }
 const convertToYMD = (dateStr: string) => {
  const [datePart] = dateStr.split(" ");  // "2022-06-29"
  return datePart;                        // already in YYYY-MM-DD
};
  const averagePercentage = courses.length
    ? (
        courses.reduce((sum, c) => sum + (c.Percentage || 0), 0) /
        courses.length
      ).toFixed(2)
    : "0.00";
  const transcriptRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,
    //  onAfterPrint: () => setHideActions(false),
    documentTitle: `${studentName}-Transcript`,
  });
  return (
    <>
      <button onClick={reactToPrintFn} className="export-button">
        Print
      </button>
      <div ref={transcriptRef} className="printable-content print-area ">
        <div
          className="transcript-container"
          style={{ pageBreakAfter: "always" }}
        >
          {/* Header: Logo and Institution Name */}
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
          <div className="info-row">
            <div className="left">
              <span style={{ fontWeight: "550" }}>Student Name</span>:{" "}
              {studentName}
            </div>{" "}
            <div className="right">
              <span style={{ fontWeight: "550" }}>Enrollment No:</span>{" "}
              {student_ID}
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Enrolled at</th>
                <th className={styles.th}>Overall Class Name</th>

                <th className={styles.th}>Letter Grade</th>
                <th className={styles.th}>Average of Percent%</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: any, index: number) => (
                <tr key={course.Course_Code + index} className={styles.trHover}>
                  <td className={styles.td}>{convertToYMD(course.Enrolled_At)}</td>
                  <td className={styles.td}>{course.Course_Name}</td>

                  <td className={styles.td}>{course.Grade}</td>
                  <td className={styles.td}>{course.Percentage?.toFixed(2)}</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr className={styles.trTotal}>
                <td className={styles.td} colSpan={3}>
                  <strong>Grand Total / Average</strong>
                </td>
                <td className={styles.td}>
                  <strong>{averagePercentage}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GradeReport;
