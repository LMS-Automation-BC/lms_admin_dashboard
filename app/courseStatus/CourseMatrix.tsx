import React from "react";
import styles from "./CourseMatrix.module.css";

interface CourseRecord {
  Default_Course_Name: string;
  Grade: string;
}

interface CourseMatrixProps {
  selectedProgram: string | null;
  programs: Record<string, { Course_Name: string }[]>;
  students: Record<string, CourseRecord[]>;
}

const CourseMatrix: React.FC<CourseMatrixProps> = ({
  selectedProgram,
  programs,
  students,
}) => {
  if (!selectedProgram || !programs[selectedProgram] || !students) return null;

  const headers = programs[selectedProgram].map((p) => p.Course_Name);
  const studentNames = Object.keys(students);

  return (
    <div className={styles.container}><div className="tableWrapper">
      <table className={styles.table}>
        <thead>
          <tr>
            {/* First sticky column */}
            <th className={`${styles.cell} ${styles.stickyHeader} ${styles.stickyCol}`}>
              Student Name
            </th>

            {/* Horizontal course headers */}
            {headers.map((courseName) => (
              <th key={courseName} className={`${styles.cell} ${styles.stickyHeader}`}>
                {courseName}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {studentNames.map((student) => (
            <tr key={student}>
              {/* First sticky column */}
              <td className={`${styles.cell} ${styles.stickyCol}`}>{student}</td>
              {headers.map((courseName) => {
                const record = students[student].find(
                  (x) => x.Default_Course_Name === courseName
                );

                const cellClass = !record
                  ? styles.notTaken
                  : record.Grade === "F"
                  ? styles.fail
                  : styles.taken;

                const cellText = !record
                  ? "❌"
                  : record.Grade === "F"
                  ? `⚠️ ${record.Grade}`
                  : `✅ ${record.Grade}`;

                return (
                  <td key={student + courseName} className={`${styles.cell} ${cellClass}`}>
                    {cellText}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
};

export default CourseMatrix;
