import React, { useRef, useState, useEffect } from "react";
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
  const [gradeData, setGradeData] = useState<CsvRow[]>(courses || []);
  const [assignmentsData, setAssignmentsData] = useState<CsvRow[]>([]);
  const [coursesTranscript, setCoursesTranscript] = useState<CsvRow[]>(
    courses || []
  );
  const [showAssignments, setShowAssignments] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [diffData, setDiffData] = useState<any[]>([]);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [hideActions, setHideActions] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,
    onAfterPrint: () => setHideActions(false),
    documentTitle: `${studentName}-${showAssignments ? "Assignments" : "Transcript"}`,
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
    if (showAssignments) {
      setAssignmentsData((prev) =>
        prev.filter((c) => c.Course_Code !== courseCode)
      );
    } else {
      setGradeData((prev) =>
        prev.filter((c) => c.Course_Code !== courseCode)
      );
    }
  };

  const convertToYMD = (dateStr: string) => dateStr?.split(" ")[0];

  // Fetch assignments when showAssignments becomes true, restore grades when toggled back
  useEffect(() => {
    if (showAssignments && student_ID) {
      setAssignmentsLoading(true);
      const fetchAssignments = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?studentId=${student_ID}&assignments=true`);
          if (response.ok) {
            const data = await response.json();
            setAssignmentsData(data || []);
            setCoursesTranscript(data || []);
          } else {
            console.error('Failed to fetch assignments:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
        } finally {
          setAssignmentsLoading(false);
        }
      };
      fetchAssignments();
    } else if (!showAssignments) {
      // Restore grade data when toggling back to grades
      setCoursesTranscript(gradeData);
    }
  }, [showAssignments, student_ID, gradeData]);

  // Wrapper to update both coursesTranscript and gradeData
  const handleUpdateTranscript: React.Dispatch<React.SetStateAction<CsvRow[]>> = (newDataOrFn) => {
    const newData = typeof newDataOrFn === 'function' ? newDataOrFn(coursesTranscript) : newDataOrFn;
    setCoursesTranscript(newData);
    if (!showAssignments) {
      setGradeData(newData);
    } else {
      setAssignmentsData(newData);
    }
  };

  const averagePercentage = coursesTranscript.length
    ? (
        coursesTranscript.reduce((sum, c) => sum + (c.Percentage || 0), 0) /
        coursesTranscript.length
      ).toFixed(2)
    : "0.00";

  // Show loading state when fetching assignments
  if (showAssignments && assignmentsLoading) {
    return (
      <>
        <div className={styles.toolbar}>
          <button onClick={handlePrint} className="export-button">
            Print
          </button>
          {student_ID && (
            <GetReportButton
              enrollmentNo={student_ID}
              viewOnly={false}
              reportLoading={reportLoading}
              setReportLoading={setReportLoading}
              setCoursesTranscript={handleUpdateTranscript}
              setDiffData={setDiffData}
              setShowDiffModal={setShowDiffModal}
              existingTranscript={coursesTranscript}
              assignments={showAssignments}
            />
          )}
          <div className={styles.toggleContainer}>
            <span className={styles.toggleLabel}>Grades</span>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                id="assignmentsToggle"
                checked={showAssignments}
                onChange={() => setShowAssignments(!showAssignments)}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.toggleLabel}>Assignments</span>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading assignments...</p>
        </div>
      </>
    );
  }

  // Show no data message
  if (!coursesTranscript || coursesTranscript.length === 0) {
    return <p>No course data available.</p>;
  }

  return (
    <>
      <div className={styles.toolbar}>
        <button onClick={handlePrint} className="export-button">
          Print
        </button>
        {student_ID && (
          <GetReportButton
            enrollmentNo={student_ID}
            viewOnly={false}
            reportLoading={reportLoading}
            setReportLoading={setReportLoading}
            setCoursesTranscript={handleUpdateTranscript}
            setDiffData={setDiffData}
            setShowDiffModal={setShowDiffModal}
            existingTranscript={coursesTranscript}
            assignments={showAssignments}
          />
        )}
        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>Grades</span>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              id="assignmentsToggle"
              checked={showAssignments}
              onChange={() => setShowAssignments(!showAssignments)}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Assignments</span>
        </div>
      </div>

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
                {showAssignments ? (
                  <>
                    <th className={styles.th}>Class Name</th>
                    <th className={styles.th}>Title</th>                    
                    
                    <th className={styles.th}>Started At</th>
                    <th className={styles.th}>Section Code</th>
                    <th className={styles.th}>Score</th>
                    {!hideActions && <th className={styles.th}>Actions</th>}
                  </>
                ) : (
                  <>
                    <th className={styles.th}>Enrolled at</th>
                    <th className={styles.th}>Overall Class Name</th>
                    <th className={styles.th}>Letter Grade</th>
                    <th className={styles.th}>Average of Percent%</th>
                    {!hideActions && <th className={styles.th}>Actions</th>}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {coursesTranscript.map((course, index) => (
                <tr key={course.Course_Code ? `${course.Course_Code}-${index}` : `assignment-${index}`} className={styles.trHover}>
                  {showAssignments ? (
                    <>
                      
                      <td className={styles.td}>{course.Class_Name || "N/A"}-{course.Type?.split('Assignment')[0] || "N/A"}</td>
                      <td className={styles.td}>{course.Title || "N/A"}</td>
                      <td className={`${styles.td} ${styles.tdNoWrap}`}>
                        {course.Started_At ? convertToYMD(course.Started_At) : "N/A"}
                      </td>
                      <td className={styles.td}>{course.Section_Code || "N/A"}</td>
                      <td className={styles.td}>{course.Score || "N/A"}</td>
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
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </tr>
              ))}
              {/* GRAND TOTAL */}
              <tr className={styles.trTotal}>
                <td className={styles.td} colSpan={showAssignments ? 2 : 3}>
                  <strong>{showAssignments ? "Total" : "Grand Total / Average"}</strong>
                </td>
                <td className={styles.td}>
                  <strong>{averagePercentage}</strong>
                </td>
                {!showAssignments && <td className={styles.td}></td>}
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
