import React, { useRef, useState } from "react";
import styles from "./GradeReport.module.css";
import "./transcripts/GradeTranscript.css";
import { useReactToPrint } from "react-to-print";
import GetReportButton from "./GetReportButton";
import { CsvRow } from "../components/GradeParser";
import { FiTrash2 } from "react-icons/fi";

interface GradeReportProps {
  courses: CsvRow[];
  studentName: string;
  student_ID: string;
}

const GradeReport: React.FC<GradeReportProps> = ({
  courses,
  studentName,
  student_ID,
}) => {
  // ---------------- Hooks always at the top ----------------
  const [coursesTranscript, setCoursesTranscript] = useState<CsvRow[]>(
    courses || []
  );
  const [diffData, setDiffData] = useState<any[]>([]);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [hideActions, setHideActions] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,
    onAfterPrint: () => setHideActions(false),
    documentTitle: `${studentName}-Transcript`,
  });

  const handlePrint = async () => {
    setHideActions(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    reactToPrintFn();
  };

  const handleDeleteRow = (courseCode: string) => {
    if (!window.confirm("Remove this row?")) return;
    setCoursesTranscript((prev) =>
      prev.filter((c) => c.Course_Code !== courseCode)
    );
  };

  const convertToYMD = (dateStr: string) => dateStr.split(" ")[0];

  const averagePercentage = coursesTranscript.length
    ? (
        coursesTranscript.reduce((sum, c) => sum + (c.Percentage || 0), 0) /
        coursesTranscript.length
      ).toFixed(2)
    : "0.00";

  // ---------------- Conditional JSX ----------------
  if (!coursesTranscript || coursesTranscript.length === 0) {
    return <p>No course data available.</p>;
  }

  return (
    <>
      <button onClick={handlePrint} className="export-button">
        Print
      </button>
      {student_ID && (
        <GetReportButton
          enrollmentNo={student_ID}
          viewOnly={false}
          reportLoading={reportLoading}
          setReportLoading={setReportLoading}
          setCoursesTranscript={setCoursesTranscript}
          setDiffData={setDiffData}
          setShowDiffModal={setShowDiffModal}
          existingTranscript={coursesTranscript}
        />
      )}

      <div ref={transcriptRef} className="printable-content print-area">
      
        <div
          className="transcript-container"
          style={{ pageBreakAfter: "always" }}
        >
          {/* Header */}
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

          {/* Student Info */}
          <div className={styles.inforow}>
            <div className={styles.left}>
              <span style={{ fontWeight: 550 }}>Student Name</span>:{" "}
              {studentName}
            </div>
            <div className={styles.right}>
              <span style={{ fontWeight: 550 }}>Enrollment No:</span>{" "}
              {student_ID}
            </div>
          </div>

          {/* TABLE */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Enrolled at</th>
                <th className={styles.th}>Overall Class Name</th>
                <th className={styles.th}>Letter Grade</th>
                <th className={styles.th}>Average of Percent%</th>
                {!hideActions && <th className={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {coursesTranscript.map((course, index) => (
                <tr key={course.Course_Code + index} className={styles.trHover}>
                  <td className={`${styles.td} ${styles.tdNoWrap}`}>
                    {convertToYMD(course.Enrolled_At)}
                  </td>
                  <td className={styles.td}>{course.Course_Name}</td>
                  <td className={styles.td}>{course.Grade}</td>
                  <td className={styles.td}>{course.Percentage?.toFixed(2)}</td>
                  {!hideActions && (
                    <td className={`${styles.td} no-print`}>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteRow(course.Course_Code)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {/* GRAND TOTAL */}
              <tr className={styles.trTotal}>
                <td className={styles.td} colSpan={3}>
                  <strong>Grand Total / Average</strong>
                </td>
                <td className={styles.td}>
                  <strong>{averagePercentage}</strong>
                </td>
                <td className="no-print"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GradeReport;
