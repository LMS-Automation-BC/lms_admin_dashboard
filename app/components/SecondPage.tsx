import React from "react";
import styles from "./SecondPage.module.css";
import "./GradeTranscript.css";
import { gradeScale } from "../grades/helpers/grade";
import SpecialGradesTable from "./SpecialGradesTable";
import GPA from "./GPA";
import ContactColumns from "./GradeOrganization";

const SecondPage: React.FC = () => {
  const grouped = gradeScale.reduce<Record<string, typeof gradeScale>>(
    (acc, row) => {
      const key = row.description || "—";
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    },
    {}
  );
  return (
    <div className={styles.secondPage}>
      <div className={styles.header}>
        <img
          src="/brookes_college.png"
          alt="Institution Logo"
          className={styles.logo}
        />
        <div className={styles["vertical-line"]} />
        <div className={styles["institution-name-wrapper"]}>
          <div className={`${styles["institution-name"]} ${styles.brookes}`}>
            Brookes
          </div>
          <div className={`${styles["institution-name"]} ${styles.college}`}>
            College
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <div className={styles["title-sp"]}>Grading System</div>
      </div>

      <div>
        <p>
          Each of the courses in a program is evaluated by an instructor through
          various components during academic terms. These evaluation components
          shall be communicated for each of the courses in the course
          outline/session plan at the commencement of the course. The Letter
          grades and corresponding grade points shall be awarded as follows:
        </p>
      </div>

      <table className={styles.gradingTable} style={{ width: "60%" }}>
        <thead>
          <tr>
            <th>Percentage Range</th>
            <th>Letter Grade</th>
            <th>Grade Points</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([desc, rows]) =>
            rows.map((row, index) => (
              <tr key={`${row.grade}-${index}`}>
                <td>
                  {row.min} – {row.max}
                </td>
                <td>{row.grade}</td>
                <td>{row.gpa.toFixed(1)}</td>
                {index === 0 && <td rowSpan={rows.length}>{desc}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div>
        <p>
          The special grade may be assigned to the students in different
          circumstances. It should be noted that these special grades are not
          included while calculating the Grade Point Average.
        </p>
      </div>
      <SpecialGradesTable></SpecialGradesTable>
      <div>
        <p>
          <span style={{ fontWeight: "bold" }}>
            Computation of Grade Point Average (GPA){" "}
          </span>
          <br></br>
          The Grade Point Average is calculated by multiplying the Grade Points
          for each Course with some credits for that course, added together, and
          dividing by the total number of credits or hours. In other words, it
          will be reflected in the following formula.
        </p>
      </div>
      <GPA></GPA>
      <div
        style={{
         position:"relative",
          bottom: 0,
          width: "100%",
          margin: "0 auto",
        }}
        className="footer"
      >
        <ContactColumns></ContactColumns>
      </div>
    </div>
  );
};

export default SecondPage;
