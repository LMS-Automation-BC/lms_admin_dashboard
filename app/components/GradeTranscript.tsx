import { useEffect, useRef, useState } from "react";
import { CsvRow } from "./GradeParser";
import "./GradeTranscript.css";
import { FaEdit, FaSave, FaTrash, FaTimes } from "react-icons/fa";
import { extractMonthYear } from "../grades/helpers/grade";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TranscriptPDF from "./GradeTranscriptPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
interface TranscriptProps {
  studentName: string | undefined;
  program: string | null;
  programStartDate: string | null;
  enrollmentNo: string | undefined;
  printDate: string;
  courses: CsvRow[];
  credits: number;
  cumulativeGpa: number;
  totalCredits: number;
}

const GradeTranscript: React.FC<TranscriptProps> = ({
  studentName,
  program,
  programStartDate,
  enrollmentNo,
  printDate,
  courses,
  credits,
  cumulativeGpa,
  totalCredits,
}) => {
  const toInputDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // "2025-09-01"
  };
  console.log("courses");
  console.log(JSON.stringify(courses));
  const [coursesTranscript, setCoursesTranscript] = useState(courses);
  console.log(JSON.stringify(coursesTranscript));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<CsvRow | undefined>();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [hideActions, setHideActions] = useState(false);
  const [programStatus, setProgramStatus] = useState<string>("");
  const [programStart, setProgramStart] = useState(
    toInputDate(programStartDate)
  );
  const [transcriptPrint, setTranscriptPrint] = useState(
    toInputDate(new Date().toISOString())
  );
  useEffect(() => {
    setCoursesTranscript(courses);
  }, [courses]);
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
    const updated = [...courses];
    updated.splice(index, 1);
    setCoursesTranscript(updated);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedRow({ ...courses[index] });
  };

  const handleSave = (index: number) => {
    const updated = [...courses];
    if (editedRow) updated[index] = editedRow;
    setCoursesTranscript(updated);
    setEditingIndex(null);
  };

  type CsvField = keyof CsvRow;

  const handleChange = (field: CsvField, value: string) => {
    setEditedRow((prev) => {
      if (!prev) return prev; // or throw error if it should never be undefined here
      return { ...prev, [field]: value };
    });
  };
  let data = {
    studentName,
    program,
    programStartDate: programStart,
    enrollmentNo: enrollmentNo,
    printDate: transcriptPrint,
    courses: coursesTranscript,
    credits: credits,
    cumulativeGpa: cumulativeGpa,
    programStatus: programStatus,
  };
  const safeCourses = Array.isArray(courses)
  ? JSON.parse(JSON.stringify(courses))
  : [];
  return (
    <div className="transcript-page">
      
      {/* <PDFDownloadLink
        document={
          <TranscriptPDF
            studentName={studentName || ''}
            program={program || ''}
            programStartDate={programStartDate || ''}
            enrollmentNo={enrollmentNo || ''}
            printDate={printDate || ''}
            courses={Array.isArray(safeCourses) ? safeCourses : []} // <-- default empty array
            credits={credits || 0}
            cumulativeGpa={cumulativeGpa || 0}
            programStatus={programStatus || ''}
          />
        }
        fileName={`${studentName || 'sample'}-transcript.pdf`}
      >
        {({ loading }) =>
          loading ? (
            <span className="pdf-download-link disabled">
              Generating PDF...
            </span>
          ) : (
            <span className="pdf-download-link">Download Transcript PDF</span>
          )
        }
      </PDFDownloadLink> */}
    

      <button onClick={exportToPdf} className="export-button">
        Export to PDF
      </button>
      <div ref={transcriptRef}>
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
        <div className="title">Transcript of Academic Records</div>

        {/* Student Information */}
        <div className="info-row">
          <div className="left">Student Name: {studentName}</div>
          <div className="right">Program: {program}</div>
        </div>
        <div className="info-row">
          {hideActions ? (
            <div className="right">Program Start Date: {programStart}</div>
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
          <div className="left">Enrollment No: {enrollmentNo}</div>
          <div className="right">
            {hideActions ? (
              <div className="right">
                Transcript Print Date: {transcriptPrint}
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
        {coursesTranscript.length > 0 && (
          <table className="grade-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Last Attempt</th>
                <th>Credits</th>
                <th>Letter Grade</th>
                <th>Grade Point</th>
                {/* {!hideActions && <th>Actions</th>} */}
              </tr>
            </thead>
            <tbody>
              {courses.map((row, index) => {
                const isEditing = index === editingIndex;
                return (
                  <tr key={index}>
                    <td>
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
                    <td>
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
                    <td>{(row["Last Attempt"]) || ""}</td>
                    <td>
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
                    <td>
                      {isEditing ? (
                        <input
                          value={
                            isEditing && editedRow ? editedRow["Grade"] : ""
                          }
                          onChange={(e) =>
                            handleChange("Grade", e.target.value)
                          }
                        />
                      ) : (
                        row["Grade"]
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={
                            isEditing && editedRow
                              ? editedRow["Grade Point"]
                              : ""
                          }
                          onChange={(e) =>
                            handleChange("Grade Point", e.target.value)
                          }
                        />
                      ) : (
                        row["Grade Point"]
                      )}
                    </td>
                    {/* {!hideActions && (
                      <td>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(index)}
                              className="icon-button save"
                            >
                              <FaSave className="icon" /> Save
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="icon-button cancel"
                            >
                              <FaTimes className="icon" /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(index)}
                              className="icon-button edit"
                            >
                              <FaEdit className="icon" /> Edit
                            </button>
                            <button
                              onClick={() => handleRemove(index)}
                              className="icon-button delete"
                            >
                              <FaTrash className="icon" /> Delete
                            </button>
                          </>
                        )}
                      </td>
                    )} */}
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4} style={{ textAlign: "right" }}>
                  Credits Earned
                </td>
                <td colSpan={3}>{credits}</td>
              </tr>
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
                <td colSpan={3}>{cumulativeGpa}</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ textAlign: "right" }}>
                  Program Status
                </td>
                <td colSpan={3}>
                  {hideActions ? (
                    programStatus || "—"
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
          <p>Note:</p>
          <ol>
            <li>
              The document is official only if original and bears an authorized
              signature with a college stamp.
            </li>
            <li>
              Information to assist in evaluating the transcript is overleaf.
            </li>
          </ol>
          <br></br>
          <p>
            Dr. Tomi Adeyemi
            <br />
            President
          </p>
          <br></br>
          <div className="contact-columns">
            <div className="column address">
              #250 6424 36 Street NE
              <br />
              Calgary AB T3J4C8, Canada
            </div>
            <div className="column phone">
              Phone: (+1) 403-800-6613 <br></br> www.brookescollege.ca
            </div>
            <div className="column email">
              <a href="mailto:hello@brookescollege.ca">
                hello@brookescollege.ca
              </a>
            </div>
          </div>
        </div>
        <br></br>
      </div>
    </div>
  );
};

export default GradeTranscript;
