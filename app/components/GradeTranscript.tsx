import { useEffect, useRef, useState } from "react";
import { CsvRow } from "./GradeParser";
import "./GradeTranscript.css";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ContactColumns from "./GradeOrganization";
import { FiCheck, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { Course } from "../grades/helpers/grades.type";
import { gradeScale } from "../grades/helpers/grade";

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

  const [coursesTranscript, setCoursesTranscript] = useState(courses);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<CsvRow | undefined>();
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [creditsEarned, setCreditsEarned] = useState<number>(0);
  const [cumulativeGpa, setCumulativeGpa] = useState<number>(0);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    pageStyle: `
    @page {
      size: auto;
      margin: 7mm;
    }
      .institution-name {
        font-family: "Times New Roman", Times, serif;
        font-size: 15pt !important;
      }
      .title {
        font-family: "Times New Roman", Times, serif;
        font-size: 15pt !important;
      }
    body {
      font-family: 'Times New Roman', Times, serif;
      -webkit-print-color-adjust: exact;
    }
  `,
    contentRef: transcriptRef,
    onAfterPrint: () => setHideActions(false),
  });
  const handlePrint = async () => {
    setHideActions(true); // Hide before printing
    await new Promise((resolve) => setTimeout(resolve, 0)); // Let React update the UI
    reactToPrintFn();
  };
  const [hideActions, setHideActions] = useState(false);
  const [programStatus, setProgramStatus] = useState<string>("");
  const [programStart, setProgramStart] = useState(
    toInputDate(programStartDate)
  );
  const [transcriptPrint, setTranscriptPrint] = useState(
    toInputDate(new Date().toISOString())
  );
  useEffect(() => {
    calculateScores(courses);
    setCoursesTranscript(courses);
  }, [courses]);
  useEffect(() => {
    calculateScores(coursesTranscript);
  }, [coursesTranscript]);
  const generatePDF = () => {
    setHideActions(true);
    if (!transcriptRef.current) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });
    transcriptRef.current.classList.add("pdf-export");

    doc.html(transcriptRef.current, {
      callback: function (doc) {
        doc.save(studentName + "-Transcript.pdf");
        setHideActions(false);
      },
      x: 20,
      y: 20,
      html2canvas: {
        scale: 0.7,
      },
    });
  };
  const exportToPdf = async () => {
    if (!transcriptRef.current) return;

    setHideActions(true);

    // Wait for the DOM to update after hiding actions column
    await new Promise((r) => setTimeout(r, 100));

    // Capture the transcript div as canvas
    const canvas = await html2canvas(transcriptRef.current, {
      scale: 2, // Higher scale for better resolution
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    // jsPDF settings for US Letter size in points (1 pt = 1/72 inch)
    const pdf = new jsPDF({
      unit: "pt",
      format: "letter", // US Letter 612 x 792 pts
      orientation: "portrait",
    });

    // Margins in points (e.g., 40pt = ~0.56 inches)
    const margin = 40;

    // Calculate available width and height inside margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    // Calculate image width and height maintaining aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

    const pdfWidth = imgWidth * ratio;
    const pdfHeight = imgHeight * ratio;

    // Add image to PDF with margin offsets
    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);

    pdf.save("transcript.pdf");

    setHideActions(false);
  };

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
    let processedusers = users.map((user: any) => {
      if (user["Grade Point"] != 0) creditsEarned += user["Credits"];
      totalGPA += user["Credits"] * user["Grade Point"];
      // console.log(user["Program Start Date"])
      return user;
    });

    setTotalCredits(totalCredits);
    setCumulativeGpa(totalGPA / totalCredits);
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

  return (
    <div
      className="transcript-page"
      style={{ width: "100%", maxWidth: "572pt" }}
    >
      <div>
        <button onClick={handlePrint} className="export-button">
          Print
        </button>
        <div ref={transcriptRef} className="printable-content print-area "></div>
      </div>
      {/* <button onClick={generatePDF} className="export-button">
        Export to PDF
      </button> */}
      <div ref={transcriptRef} style={{ width: "100%", padding: "5mm" }}>
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
          <div className="right">
            <span style={{ fontWeight: "550" }}>Program:</span> {program}
          </div>
        </div>
        <div className="info-row">
          {hideActions ? (
            <div className="right">
              <span style={{ fontWeight: "550" }}>Program Start Date</span>:{" "}
              {programStart}
            </div>
          ) : (
            <label htmlFor="programStartDate" className="right">
              Program Start Date:{" "}
              <input
                type="date"
                id="programStartDate"
                value={programStart}
                onChange={(e) => setProgramStart(e.target.value)}
              />
            </label>
          )}
        </div>
        <div className="info-row">
          <div className="left">
            <span style={{ fontWeight: "550" }}>Enrollment No:</span>{" "}
            {enrollmentNo}
          </div>
          <div className="right">
            {hideActions ? (
              <div className="right">
                <span style={{ fontWeight: "550" }}>
                  {" "}
                  Transcript Print Date:
                </span>{" "}
                {transcriptPrint}
              </div>
            ) : (
              <label htmlFor="programStartDate" className="right">
                Transcript Print Date:{" "}
                <input
                  type="date"
                  id="programStartDate"
                  value={transcriptPrint}
                  onChange={(e) => setTranscriptPrint(e.target.value)}
                />
              </label>
            )}
          </div>
        </div>
        <br></br>
        {coursesTranscript.length > 0 && (
          <table className="grade-table">
            <thead >
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
                    <td className="course-name">
                      {isEditing ? (
                        <input
                          value={
                            isEditing && editedRow
                              ? editedRow["Default Class Name"]
                              : ""
                          }
                          onChange={(e) =>
                            handleChange("Default Class Name", e.target.value)
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
                            isEditing && editedRow ? editedRow["Credits"] : ""
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
                        </select>
                      ) : (
                        row["Grade"]
                      )}
                    </td>

                    <td className="grade-point">{row["Grade Point"]}</td>
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
              {programStatus != "Complete" ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "right" }}>
                    Credits Earned
                  </td>
                  <td colSpan={3}>{creditsEarned}</td>
                </tr>
              ) : (
                <></>
              )}
              <tr>
                <td colSpan={4} style={{ textAlign: "right" }}>
                  Total Credits
                </td>
                <td colSpan={3}>{totalCredits}</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ textAlign: "right" }}>
                  Cumulative Grade Point Average (CGPA)
                </td>
                <td colSpan={3}>{cumulativeGpa.toFixed(1)}</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ textAlign: "right" }}>
                  Program Status
                </td>
                <td colSpan={3}>
                  {hideActions ? (
                    programStatus || "Complete"
                  ) : (
                    <select
                      value={programStatus}
                      onChange={(e) => setProgramStatus(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <option value="">-- Select status --</option>
                      <option value="Complete">Complete</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="note">
          <p
            style={{
              textDecoration: "underline",
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            Note:
          </p>
          <ol style={{ fontStyle: "italic" }}>
            <li>
              1. The document is official only if original and bears an
              authorized signature with a college stamp.
            </li>
            <li>
              2. Information to assist in evaluating the transcript is overleaf.
            </li>
          </ol>
          <br></br>
          <ContactColumns></ContactColumns>
        </div>
      </div>
    </div>
  );
};

export default GradeTranscript;
