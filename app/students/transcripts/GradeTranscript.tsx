"use client";
import { useEffect, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "@/app/components/GradeTranscript.css";
import { useReactToPrint } from "react-to-print";
import ContactColumns, { OrgData } from "@/app/components/GradeOrganization";
import { CsvRow } from "@/app/components/GradeParser";
import SecondPage from "@/app/components/SecondPage";
import TranscriptDate from "@/app/components/TranscriptDate";
import { gradeScale } from "@/app/grades/helpers/grade";
import { parseISO, format } from "date-fns";
import { FiCheck, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import UnfinishedCoursesList, {
  getUnfinishedCourses,
} from "./UnfinishedCoursesList";
import TranscriptHistory from "./TranscriptHistory";
import TranscriptDiffModal, {
  compareTranscriptArrays,
} from "./TranscriptDiffModal";

interface TranscriptProps {
  studentName: string | undefined;
  program: string | null;
  programStartDate: string | null;
  enrollmentNo: string | undefined;
  printDate: string;
  courses: CsvRow[];
  selectedProgram: Course[];
  sisId: string;
  viewOnly:boolean;
  // unfinishedCourses: Course[];
}

const GradeTranscript: React.FC<TranscriptProps> = ({
  studentName,
  program,
  programStartDate,
  enrollmentNo,
  printDate,
  courses,
  selectedProgram,
  sisId,
  viewOnly
  // unfinishedCourses,
}) => {
  const [unfinishedCourses, setUnfinishedCourses] = useState(
    getUnfinishedCourses(selectedProgram, courses)
  );
  const courseoptions = unfinishedCourses.map((course) => ({
    value: course.Course_Name,
    label: course.Course_Name,
  }));

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
  const generatePdfFromDom = async (element: any) => {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Return Base64 without prefix
    return pdf.output("datauristring").split(",")[1];
  };
  const handlePrint = async () => {
    setHideActions(true); // Hide before printing
    await new Promise((resolve) => setTimeout(resolve, 0)); // Let React update the UI
    const pdfBase64 = await generatePdfFromDom(transcriptRef.current);
    // Send to backend
    // await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     id: sisId,
    //     filename: `${studentName}-Transcript.pdf`,
    //     file_type: "pdf",
    //     file: pdfBase64,
    //   }),
    // });
    reactToPrintFn();
  };
  const [html, setHtml] = useState("");
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [diffData, setDiffData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
 const handleGetReport = async () => {
  try {
    setReportLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?type=getfromlms&studentId=${enrollmentNo}`
    );

    const data = await res.json();

    setCoursesTranscript([...data]);

    const diffs = compareTranscriptArrays(coursesTranscript, data);
    setDiffData(diffs);

    setShowDiffModal(true);
  } catch (err) {
    console.error("Error fetching report:", err);
  } finally {
    setReportLoading(false); // now runs at the correct time
  }
};

  const [reloadTranscript, setReloadTranscript] = useState(0);
  const markAsTranscriptCreated = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/transcript?action=create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Student_ID: enrollmentNo,
            Transcript_Data: JSON.stringify(coursesTranscript),
            CreatedDate: new Date().toISOString(),
          }),
        }
      );

      const newTranscript = await res.json();
      console.log("Created transcript:", newTranscript);
      // Optionally refresh transcript table
      setReloadTranscript((prev) => prev + 1);
    } catch (err) {
      console.error("Error creating transcript:", err);
    }
  };
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
    setHasFail(coursesTranscript.some((row) => row.Grade === "F"));
  };
  useEffect(() => {
    setUnfinishedCourses([
      ...getUnfinishedCourses(selectedProgram, coursesTranscript),
    ]);
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
        (sum, course) => sum + (course.Credits || 0),
        0
      );
    }
    let totalGPA = 0;
    let creditsEarned = 0;
    let creditsToConsider = totalCredits;
    let processedusers = users.map((user: any) => {
      if (
        user["Grade_Point"] != 0 &&
        user["Grade"] !== "TR" &&
        user["Grade"] !== "RW"
      )
        creditsEarned += user["Credits"];
      //if tr detect from total credits
      if (user["Grade"] == "TR" || user["Grade"] == "RW") {
        user["Grade_Point"] = "NA";
        creditsToConsider -= user["Credits"];
      }
      if (user["Grade"] !== "TR" && user["Grade"] !== "RW")
        totalGPA += user["Credits"] * user["Grade_Point"];
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
      if (!prev) return prev;

      let updatedRow = { ...prev, [field]: value };

      if (field === "Default_Course_Name") {
        const match = unfinishedCourses.find(
          (x) =>
            x.Course_Name.toLowerCase().trim() === value.toLowerCase().trim()
        );

        updatedRow = {
          ...updatedRow, // <-- KEEP existing updates!
          Course_Code: match?.Course_Code || prev["Course_Code"],
        };
      }

      if (field === "Grade") {
        const gradeInfo = gradeScale.find((g) => g.grade === value);
        if (gradeInfo) {
          updatedRow["Grade_Point"] = gradeInfo.gpa.toFixed(1);
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
      const className = row["Default_Course_Name"];
      if (className) acc[className] = (acc[className] || 0) + 1;
      return acc;
    },
    {}
  );

  // Function to check if a row is duplicate
  const isDuplicate = (row: CsvRow) =>
    row["Default_Course_Name"] &&
    defaultClassCount[row["Default_Course_Name"]] > 1;
  return (
    <>
      <TranscriptDiffModal
        isOpen={showDiffModal}
        differences={diffData}
        onClose={() => setShowDiffModal(false)}
      />
      {!viewOnly && <UnfinishedCoursesList unfinishedCourses={unfinishedCourses} />}
      {!viewOnly && (<div style={{ border: "1px solid", width: "30%" }}>
        <p style={{ fontSize: "20", fontWeight: "bold" }}>
          Course Discrepancy Highlight codes
        </p>
        <ul>
          <li className="duplicate-highlight"> (Duplicate)</li>
          <li>Program course</li>
          <li className="notinprogram">
            Random Elective Course - XYZ123 (Not in Program)
          </li>
        </ul>
      </div>)}
      {!viewOnly && enrollmentNo && studentName && program &&(
        <TranscriptHistory studentId={enrollmentNo} 
        student_name={studentName}
        program={program}
        selectedProgram={selectedProgram}
        reload={reloadTranscript} />
      )}
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
          </button>{" "}
          <button
          hidden={viewOnly}
            onClick={handleGetReport}
            className="export-button"
            disabled={reportLoading}
          >
            {reportLoading ? "Loading..." : "Get Report From LMS"}
          </button>{" "}
          <button  hidden={viewOnly} onClick={markAsTranscriptCreated} className="export-button">
            Transcript Created
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
                  {formatDateWithHyphen(
                    rePrint ? transcriptPrint : programStart
                  )}
                </div>
              ) : (
                <TranscriptDate
                  label={
                    rePrint ? "Transcript Print Date" : "Program Start Date"
                  }
                  hideActions={hideActions}
                  programStart={rePrint ? transcriptPrint : programStart}
                  setProgramStart={
                    rePrint ? setTranscriptPrint : setProgramStart
                  }
                />
              )}
            </div>
            <div className="info-row">
              <div className="left">
                {rePrint ? (
                  <div className="right">
                    <span style={{ fontWeight: "550" }}>Program:</span>{" "}
                    {program}
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
                    rePrint
                      ? "Transcript RePrint Date"
                      : "Transcript Print Date"
                  }
                  hideActions={hideActions || viewOnly}
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
                                    ? editedRow["Course_Code"]
                                    : ""
                                }
                                onChange={(e) =>
                                  handleChange("Course_Code", e.target.value)
                                }
                              />
                            ) : (
                              row["Course_Code"] || row["Course_Code"]
                            )}
                          </td>
                          <td
                            title={row["Course_Name"]} // ← shows on hover
                            className={`course-name ${
                              isDuplicate(row)
                                ? "duplicate-highlight"
                                : row.isInProgram === false
                                ? "notinprogram"
                                : ""
                            }`}
                          >
                            {isEditing ? (
                              <CreatableSelect
                                value={
                                  isEditing && editedRow
                                    ? {
                                        value: editedRow["Default_Course_Name"],
                                        label: editedRow["Default_Course_Name"],
                                      }
                                    : null
                                }
                                onChange={(selectedOption: any) =>
                                  handleChange(
                                    "Default_Course_Name",
                                    selectedOption?.value || ""
                                  )
                                }
                                options={courseoptions}
                                isClearable
                                placeholder="Select or type a course"
                              />
                            ) : (
                              row["Default_Course_Name"]
                            )}
                          </td>
                          <td className="last-attempt">
                            {isEditing ? (
                              <input
                                value={
                                  isEditing && editedRow
                                    ? editedRow["Last_Attempt"]
                                    : ""
                                }
                                onChange={(e) =>
                                  handleChange("Last_Attempt", e.target.value)
                                }
                              />
                            ) : (
                              row["Last_Attempt"]
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
                                <option key={"TR"} value={"TR"}>
                                  {"TR"}
                                </option>
                                <option key={"RW"} value={"RW"}>
                                  {"RW"}
                                </option>
                              </select>
                            ) : (
                              row["Grade"]
                            )}
                          </td>

                          <td className="grade-point">
                            {row["Grade"] !== "TR" && row["Grade"] !== "RW"
                              ? Number(row["Grade_Point"]).toFixed(1)
                              : row["Grade_Point"]}
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
      </div>
    </>
  );
};

export default GradeTranscript;
