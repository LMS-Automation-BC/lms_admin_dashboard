import React, { useRef } from "react";
import styles from "./GradeReport.module.css";
import "./transcripts/GradeTranscript.css"
import { useReactToPrint } from "react-to-print";
export interface Course {
  Course_Name: string;
  Course_Code: string;
  Grade: string;
  Percentage: number;
}

interface GradeReportProps {
  courses: Course[];
  studentName:string;
  student_ID: string;
}

const GradeReport: React.FC<GradeReportProps> = ({ courses, studentName, student_ID }) => {
  if (!courses || courses.length === 0) {
    return <p>No course data available.</p>;
  }
 const transcriptRef = useRef<HTMLDivElement>(null);
 const reactToPrintFn = useReactToPrint({
     contentRef: transcriptRef,
    //  onAfterPrint: () => setHideActions(false),
     documentTitle: `${studentName}-Transcript`,
   });
  return (<>
    <button onClick={reactToPrintFn} className="export-button">
            Print
          </button>
    <div ref={transcriptRef}
          className="printable-content print-area ">
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
              </div> <div className="right">
                <span style={{ fontWeight: "550" }}>Enrollment No:</span>{" "}
                {student_ID}
              </div>
              </div>
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Course Name</th>
          <th className={styles.th}>Course Code</th>
          <th className={styles.th}>Grade</th>
          <th className={styles.th}>Percentage</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
  <tr key={course.Course_Code} className={styles.trHover}>
    <td className={styles.td}>{course.Course_Name}</td>
    <td className={styles.td}>{course.Course_Code}</td>
    <td className={styles.td}>{course.Grade}</td>
    <td className={styles.td}>{course.Percentage?.toFixed(2)}</td>
  </tr>
  
))}

      </tbody>
    </table>
    </div></div></>
  );
};

export default GradeReport;
