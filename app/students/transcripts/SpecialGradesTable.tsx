import React from "react";
import styles from "./SecondPage.module.css";

const specialGrades = [
  {
    symbol: "AU",
    term: "Audit Course",
    description:
      "Assigned when the student is registered to audit a course. (Students can take an additional course by paying stipulated fees. However, its evaluation is not part of the CGPA in the official transcript)",
  },
  {
    symbol: "CR",
    term: "Credit Received",
    description: "Assigned when the student successfully passes a challenge examination",
  },
  {
    symbol: "IC",
    term: "Incomplete",
    description: "Assigned with permission of the Dean",
  },
  {
    symbol: "IP",
    term: "In Progress",
    description: "Assigned when the student is in the process of completing a course",
  },
  {
    symbol: "P",
    term: "Pass",
    description:
      "Assigned when a student meets the requirements to complete a course based on Pass or Fail",
  },
  {
    symbol: "PF",
    term: "Practicum Fail",
    description: "Assigned when the student fails practicum",
  },
  {
    symbol: "{ }",
    term: "Repeated Course",
    description:
      "It means the student repeated the course and the lowest grade is not calculated in earned credits or GPA",
  },
  {
    symbol: "RW",
    term: "Required to Withdraw",
    description:
      "Assigned when the student is asked to withdraw from a course by the instructor or Dean",
  },
  {
    symbol: "TR",
    term: "Transfer",
    description: "Assigned when the course is transferred from another institution or an alternate Brookes College program.",
  },
  {
    symbol: "W",
    term: "Withdraw",
    description: "Assigned when the student withdraws from a course by their own choice",
  },
];

const SpecialGradesTable: React.FC = () => {
  return (
    <table className={styles.gradingTable} style={{width:"100% !important"}}>
      <thead>
        <tr>
          <th style={{width:"10%"}}>Symbol</th>
          <th>Term</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {specialGrades.map((row, index) => (
          <tr key={index}>
            <td>{row.symbol}</td>
            <td>{row.term}</td>
            <td style={{ textAlign: "justify" }}>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SpecialGradesTable;
