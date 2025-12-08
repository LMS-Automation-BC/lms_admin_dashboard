import React, { useRef } from "react";
import styles from "./AttendanceReport.module.css";
import { AttendanceRecord } from "../dbattendance/page";
import { useReactToPrint } from "react-to-print";

interface AttendanceReportProps {
  data: AttendanceRecord[];
  studentName: string;
  student_ID: string;
}
type GroupedAttendance = {
  [courseName: string]: AttendanceRecord[];
};

const groupByCourse = (data: AttendanceRecord[]): GroupedAttendance => {
  return data.reduce((acc, record) => {
    if (record.Course_Name && !acc[record.Course_Name]) {
      acc[record.Course_Name] = [];
    }
    record.Course_Name && acc[record.Course_Name].push(record);
    return acc;
  }, {} as GroupedAttendance);
};

const AttendanceReport: React.FC<AttendanceReportProps> = ({
  data,
  studentName,
  student_ID,
}) => {
  const grouped = groupByCourse(data);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,
    //  onAfterPrint: () => setHideActions(false),
    documentTitle: `${studentName}-Transcript`,
  });
  return (
    <>
      {" "}
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
        

        <div>
          {Object.entries(grouped).map(([courseName, records]) => (
            <div key={courseName} className={styles.courseGroup}>
              <h3>{courseName}</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.Id}>
                      <td>{record.Attendance_Date?.split("T")[0]}</td>
                      <td>{record.Name}</td>
                      <td>{record.Attendance_Percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div></div>
      </div>
    </>
  );
};

export default AttendanceReport;
