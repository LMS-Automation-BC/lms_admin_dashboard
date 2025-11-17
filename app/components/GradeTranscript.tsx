'use client';
import { useEffect, useRef, useState } from "react";
import { CsvRow } from "./GradeParser";
import "./GradeTranscript.css";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ContactColumns, { OrgData } from "./GradeOrganization";
import { FiCheck, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { Course } from "../grades/helpers/grades.type";
import { gradeScale } from "../grades/helpers/grade";
import TranscriptDate from "./TranscriptDate";
import { parseISO, format } from "date-fns";
import SecondPage from "./SecondPage";

interface TranscriptProps {
  studentName: string | undefined;
  program: string | null;
  programStartDate: string | null;
  enrollmentNo: string | undefined;
  printDate: string;
  courses: CsvRow[];
  selectedProgram: Course[];
}

const GradeTranscript: React.FC<TranscriptProps> = ({
  studentName,
  program,
  programStartDate,
  enrollmentNo,
  printDate,
  courses,
  selectedProgram,
}) => {
  const toInputDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // "2025-09-01"
  };
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/GradeTranscript.css"; // path in public/
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // cleanup when navigating away
    };
  }, []);

  const [coursesTranscript, setCoursesTranscript] = useState(courses);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<CsvRow | undefined>();
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [creditsEarned, setCreditsEarned] = useState<number>(0);
  const [cumulativeGpa, setCumulativeGpa] = useState<number>(0);
  const [rePrint, setRePrint] = useState<boolean>(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [hasFail, setHasFail] = useState(false);
  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,
    onAfterPrint: () => setHideActions(false),
    documentTitle: `${studentName}-Transcript`,
  });
  const handlePrint = async () => {
    setHideActions(true); // Hide before printing
    await new Promise((resolve) => setTimeout(resolve, 0)); // Let React update the UI
    reactToPrintFn();
  };
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/static/second-page.html")
      .then((response) => response.text())
      .then(setHtml)
      .catch((error) => console.error("Error loading HTML:", error));
  }, []);
  const [hideActions, setHideActions] = useState(false);
  const [programStatus, setProgramStatus] = useState<string>("");
  const [programStart, setProgramStart] = useState(
    toInputDate(programStartDate)
  );
  const [transcriptPrint, setTranscriptPrint] = useState(
    toInputDate(new Date().toISOString())
  );
  const [transcriptRePrint, setTranscriptRePrint] = useState(
    toInputDate(new Date().toISOString())
  );
  useEffect(() => {
    calculateScores(courses);
    setCoursesTranscript(courses);
    
  }, [courses]);
 const checkFail = () => {
  setHasFail(coursesTranscript.some(row => row.Grade === "F"));
};
  useEffect(() => {
    calculateScores(coursesTranscript);
    checkFail();
  }, [coursesTranscript]);
  const handleRemove = (index: number) => {
    const updated = [...coursesTranscript];
    updated.splice(index, 1);
    setCoursesTranscript(updated);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedRow({ ...coursesTranscript[index] });
  };

  const handleSave = (index: number) => {
    const updated = [...coursesTranscript];
    if (editedRow) updated[index] = editedRow;
    setCoursesTranscript(updated);
    setEditingIndex(null);
    
  };
  const calculateScores = (users: any[]) => {
    let totalCredits = 0;
    if (program) {
      totalCredits = selectedProgram?.reduce(
        (sum, course) => sum + (course.credits || 0),
        0
      );
    }
    let totalGPA = 0;
    let creditsEarned = 0;
    let creditsToConsider=totalCredits;
    let processedusers = users.map((user: any) => {
      
      if (user["Grade Point"] != 0 && user["Grade"] !== 'TR' && user["Grade"] !== 'RW') creditsEarned += user["Credits"];
      //if tr detect from total credits
      if (user["Grade"] == 'TR' || user["Grade"] == 'RW') {
        user['Grade Point'] = 'NA';
        creditsToConsider -= user["Credits"];
      }
      if(user["Grade"] !== 'TR'&& user["Grade"] !== 'RW')totalGPA += user["Credits"] * user["Grade Point"];
      // console.log(user["Program Start Date"])
      return user;
    });

    setTotalCredits(totalCredits);
    setCumulativeGpa(totalGPA / creditsToConsider);
    console.log(cumulativeGpa);
    setCreditsEarned(creditsEarned);
    return processedusers;
  };
  type CsvField = keyof CsvRow;

  const handleChange = (field: CsvField, value: string) => {
    setEditedRow((prev) => {
      if (!prev) return prev; // or throw error if it should never be undefined here
      let updatedRow = { ...prev, [field]: value };
      if (field === "Grade") {
        const gradeInfo = gradeScale.find((g) => g.grade === value);
        if (gradeInfo) {
          updatedRow["Grade Point"] = gradeInfo.gpa.toFixed(1); // or keep it as number
        }
      }
      return updatedRow;
    });
  };

  const formatDateWithHyphen = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "dd-MMMM-yyyy");
  };
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  useEffect(() => {
    fetch("/api/organization")
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setOrgData(data))
      .catch((err) => console.error(err));
  }, []);
  const defaultClassCount = coursesTranscript.reduce<Record<string, number>>(
    (acc, row) => {
      const className = row["Default Class Name"];
      if (className) acc[className] = (acc[className] || 0) + 1;
      return acc;
    },
    {}
  );

  // Function to check if a row is duplicate
  const isDuplicate = (row: CsvRow) =>
    row["Default Class Name"] &&
    defaultClassCount[row["Default Class Name"]] > 1;
  return (<> <div style = {{border: "1px solid", width:"30%"}}><p style={{fontSize:"20", fontWeight:"bold"}}>Course Discrepancy Highlight codes</p>
    <ul >
      <li className="duplicate-highlight"> (Duplicate)</li>
      <li>Program course</li>
      <li className="notinprogram">Random Elective Course - XYZ123 (Not in Program)</li>
    </ul></div>
    <div
      className="transcript-page"
      style={{ width: "100%", maxWidth: "572pt" }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={rePrint}
          onChange={() => setRePrint(!rePrint)}
        />
        Reprint
      </label>
      <div>
        <button onClick={handlePrint} className="export-button">
          Print
        </button>
        <div
          ref={transcriptRef}
          className="printable-content print-area "
        ></div>
      </div>
      {/* <button onClick={generatePDF} className="export-button">
        Export to PDF
      </button> */}
      <div ref={transcriptRef}>
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

          {/* Title */}
          <div style={{ textAlign: "center" }}>
            <div className="title">TRANSCRIPT OF ACADEMIC RECORDS</div>
          </div>

          {/* Student Information */}
          <div className="info-row">
            <div className="left">
              <span style={{ fontWeight: "550" }}>Student Name</span>:{" "}
              {studentName}
            </div>
            {rePrint ? (
              <TranscriptDate
                label="Program Start Date"
                hideActions={hideActions}
                programStart={programStart}
                setProgramStart={setProgramStart}
              />
            ) : (
              <div className="right">
                <span style={{ fontWeight: "550" }}>Program:</span> {program}
              </div>
            )}
          </div>
          <div className="info-row">
            <div className="left">
              <span style={{ fontWeight: "550" }}>Enrollment No:</span>{" "}
              {enrollmentNo}
            </div>
            {hideActions ? (
              <div className="right">
                <span style={{ fontWeight: 550 }}>
                  {rePrint ? "Transcript Print Date" : "Program Start Date"}
                </span>
                :{" "}
                {formatDateWithHyphen(rePrint ? transcriptPrint : programStart)}
              </div>
            ) : (
              <TranscriptDate
                label={rePrint ? "Transcript Print Date" : "Program Start Date"}
                hideActions={hideActions}
                programStart={rePrint ? transcriptPrint : programStart}
                setProgramStart={rePrint ? setTranscriptPrint : setProgramStart}
              />
            )}
          </div>
          <div className="info-row">
            <div className="left">
              {rePrint ? (
                <div className="right">
                  <span style={{ fontWeight: "550" }}>Program:</span> {program}
                </div>
              ) : (
                <></>
              )}
            </div>

            {hideActions ? (
              <div className="right">
                <span style={{ fontWeight: 550 }}>
                  {rePrint
                    ? "Transcript RePrint Date"
                    : "Transcript Print Date"}
                </span>
                :{" "}
                {formatDateWithHyphen(
                  rePrint ? transcriptRePrint : transcriptPrint
                )}
              </div>
            ) : (
              <TranscriptDate
                label={
                  rePrint ? "Transcript RePrint Date" : "Transcript Print Date"
                }
                hideActions={hideActions}
                programStart={rePrint ? transcriptRePrint : transcriptPrint}
                setProgramStart={
                  rePrint ? setTranscriptRePrint : setTranscriptPrint
                }
              />
            )}
          </div>
          <div className="transcript-body">
            {coursesTranscript.length > 0 && (
              <table className="grade-table">
                <thead>
                  <tr>
                    <th className="course-code">Course Code</th>
                    <th className="course-name">Course Name</th>
                    <th className="last-attempt">Last Attempt</th>
                    <th className="credits">Credits</th>
                    <th className="letter-grade">Letter Grade</th>
                    <th className="grade-point">Grade Point</th>
                    {!hideActions && <th className="grade-point">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {coursesTranscript.map((row, index) => {
                    const isEditing = index === editingIndex;
                    return (
                      <tr key={index}>
                        <td className="course-code">
                          {isEditing ? (
                            <input
                              value={
                                isEditing && editedRow
                                  ? editedRow["Course code"]
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange("Course code", e.target.value)
                              }
                            />
                          ) : (
                            row["Course code"]
                          )}
                        </td>
                        <td
                          className={`course-name ${
                            isDuplicate(row) ? "duplicate-highlight" : row.isInProgram === false ? "notinprogram":""
                          }`}
                        >
                          {isEditing ? (
                            <input
                              value={
                                isEditing && editedRow
                                  ? editedRow["Default Class Name"]
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "Default Class Name",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row["Default Class Name"]
                          )}
                        </td>
                        <td className="last-attempt">
                          {isEditing ? (
                            <input
                              value={
                                isEditing && editedRow
                                  ? editedRow["Last Attempt"]
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange("Last Attempt", e.target.value)
                              }
                            />
                          ) : (
                            row["Last Attempt"]
                          )}
                        </td>
                        <td className="credits">
                          {isEditing ? (
                            <input
                              value={
                                isEditing && editedRow
                                  ? editedRow["Credits"]
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange("Credits", e.target.value)
                              }
                            />
                          ) : (
                            row["Credits"]
                          )}
                        </td>
                        <td className="letter-grade">
                          {isEditing ? (
                            <select
                              className="grade-select"
                              value={editedRow ? editedRow["Grade"] : ""}
                              onChange={(e) =>
                                handleChange("Grade", e.target.value)
                              }
                            >
                              <option value="">Select Grade</option>
                              {gradeScale.map((item) => (
                                <option key={item.grade} value={item.grade}>
                                  {item.grade}
                                </option>
                              
                              ))}
                                <option key={'TR'} value={'TR'}>
                                  {'TR'}
                                </option>
                                <option key={'RW'} value={'RW'}>
                                  {'RW'}
                                </option>
                            </select>
                          ) : (
                            row["Grade"]
                          )}
                        </td>

                        <td className="grade-point">
                          {row['Grade'] !== 'TR' && row['Grade'] !== 'RW'? Number(row["Grade Point"]).toFixed(1) : row["Grade Point"]}
                        </td>
                        {!hideActions && (
                          <td>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSave(index)}
                                  className="button small"
                                >
                                  <FiCheck />
                                </button>
                                <button
                                  onClick={() => setEditingIndex(null)}
                                  className="button small danger"
                                >
                                  <FiX />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(index)}
                                  className="button small"
                                  title="Edit course"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleRemove(index)}
                                  className="button small danger"
                                  title="Delete course"
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {programStatus != "Completed" ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        Credits Earned
                      </td>
                      <td
                        colSpan={!hideActions ? 3 : 2}
                        style={{ textAlign: "center" }}
                      >
                        {creditsEarned}
                      </td>
                    </tr>
                  ) : (
                    <></>
                  )}
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Total Credits
                    </td>
                    <td
                      colSpan={!hideActions ? 3 : 2}
                      style={{ textAlign: "center" }}
                    >
                      {totalCredits}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Cumulative Grade Point Average (CGPA)
                    </td>
                    <td
                      colSpan={!hideActions ? 3 : 2}
                      style={{ textAlign: "center" }}
                    >
                      {(Math.round(cumulativeGpa * 1000) / 1000).toFixed(2)}
                      
                      {/* {(Math.trunc(cumulativeGpa * 100) / 100).toFixed(2)} */}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Program Status {hasFail}
                    </td>
                    <td
                      colSpan={!hideActions ? 3 : 2}
                      style={{ textAlign: "center" }}
                    >
                      {hideActions ? (
                        programStatus || "Completed"
                      ) : (
                        <select
                          value={programStatus}
                          onChange={(e) => setProgramStatus(e.target.value)}
                          style={{ width: "100%" }}
                        >
                          <option value="">-- Select status --</option>
                          <option value="Completed" disabled={hasFail}>
                            Completed
                          </option>
                          <option value="Incomplete">Incomplete</option>
                        </select>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          <div className="note">
            <p
              style={{
                textDecoration: "underline",
                fontWeight: "bold",
                fontStyle: "italic",
                fontSize: "11pt",
              }}
            >
              Note:
            </p>
            <ol
              style={{
                fontStyle: "italic",
                paddingBottom: "10px",
                fontSize: "11pt",
              }}
            >
              <li>
                1. The document is official only if original and bears an
                authorized signature with a college stamp.
              </li>
              <li>
                2. Information to assist in evaluating the transcript is
                overleaf.
              </li>
            </ol>
          </div>
          <div>
            {/* <p className="president" style={{ paddingTop: 30 }}>
              {orgData?.president}
              <br />
              President
            </p> */}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              margin: 0,
            }}
            className="footer"
          >
            <ContactColumns showPresident={true}></ContactColumns>
          </div>
        </div>

        <div className="transcript-container">
          <SecondPage></SecondPage>
          {/* <div className="html-wrapper" dangerouslySetInnerHTML={{ __html: html }} /> */}
        </div>
      </div>
    </div></>
  );
};

export default GradeTranscript;
