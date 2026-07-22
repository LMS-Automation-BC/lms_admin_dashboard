"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./GradeTranscript.css";
import { useReactToPrint } from "react-to-print";
import { CsvRow } from "@/app/components/GradeParser";
import TranscriptDate from "@/app/components/TranscriptDate";
import { gradeScale } from "@/app/grades/helpers/grade";
import { getUnfinishedCourses } from "./UnfinishedCoursesList";
import TranscriptHistory from "./TranscriptHistory";
import TranscriptDiffModal, {
  compareTranscriptArrays,
} from "./TranscriptDiffModal";
import GetReportButton from "../GetReportButton";
import { sortUserGrades } from "./Transcript";
import TranscriptPDF, { formatDateWithHyphen } from "./TranscriptPDF";
import TranscriptEditableTable from "@/app/students/transcripts/TranscriptEditableTable";
import TranscriptPrintTarget from "@/app/students/transcripts/TranscriptPrintTarget";

interface TranscriptProps {
  studentName: string | undefined;
  program: string | null;
  programStartDate: string | null;
  enrollmentNo: string | undefined;
  printDate: string;
  courses: CsvRow[];
  selectedProgram: Course[];
  sisId: string;
  viewOnly: boolean;
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
  viewOnly,
  // unfinishedCourses,
}) => {
  const sortedProgram = useMemo(() => {
    return [...selectedProgram].sort((a: any, b: any) => a.id - b.id);
  }, [selectedProgram]);

  const [unfinishedCourses, setUnfinishedCourses] = useState(
    getUnfinishedCourses(sortedProgram, courses),
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
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const reactToPrintFn = useReactToPrint({
    contentRef: transcriptRef,
    onAfterPrint: () => {
      setHideActions(false);
      setShowPrintPreview(false);
    },
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
    setShowPrintPreview(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    if (!transcriptRef.current) {
      setHideActions(false);
      setShowPrintPreview(false);
      return;
    }
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
    await reactToPrintFn();
  };
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [diffData, setDiffData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  // const handleGetReport = async () => {
  //   try {
  //     setReportLoading(true);

  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?type=getfromlms&studentId=${enrollmentNo}`,
  //     );

  //     const data = await res.json();

  //     setCoursesTranscript([...data]);

  //     const diffs = compareTranscriptArrays(coursesTranscript, data);
  //     setDiffData(diffs);

  //     setShowDiffModal(true);
  //   } catch (err) {
  //     console.error("Error fetching report:", err);
  //   } finally {
  //     setReportLoading(false); // now runs at the correct time
  //   }
  // };

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
        },
      );

      const newTranscript = await res.json();
      console.log("Created transcript:", newTranscript);
      // Optionally refresh transcript table
      setReloadTranscript((prev) => prev + 1);
    } catch (err) {
      console.error("Error creating transcript:", err);
    }
  };
  const [hideActions, setHideActions] = useState(false);
  const [programStatus, setProgramStatus] = useState<string>("");
  const [programStart, setProgramStart] = useState(
    toInputDate(programStartDate),
  );
  const [transcriptPrint, setTranscriptPrint] = useState(
    toInputDate(new Date().toISOString()),
  );
  const [transcriptRePrint, setTranscriptRePrint] = useState(
    toInputDate(new Date().toISOString()),
  );
  // useEffect(() => {
  //   calculateScores(courses);
  //   setCoursesTranscript(courses);
  // }, [courses]);
  const checkFail = () => {
    setHasFail(coursesTranscript.some((row) => row.Grade === "F"));
  };
  const sortCourses = (courses: CsvRow[]) => {
    console.log("sort courses");
    const usedIndices = new Set<number>();

    // Step 1: Build lookup map for program course order
    const courseNameToIndex: Record<string, number> = {};
    sortedProgram.forEach((course, index) => {
      courseNameToIndex[course.Course_Name.toLowerCase().trim()] = index;
    });

    // Step 2: Map matched program courses
    const matched: CsvRow[] = sortedProgram.map((programCourse) => {
      // Find first student course that hasn't been used yet and matches course name
      const index = courses.findIndex((c, i) => {
        if (usedIndices.has(i)) return false;
        return c.Default_Course_Name === programCourse.Course_Name;
      });

      if (index !== -1) {
        usedIndices.add(index);
        // Use program's course code and normalized course name to avoid duplicates
        return {
          ...courses[index],
          Course_Code: programCourse.Course_Code,
          Default_Course_Name: programCourse.Course_Name,
        };
      }

      // Not found → placeholder
      return {
        Course_Code: programCourse.Course_Code,
        Default_Course_Name: programCourse.Course_Name,
        Name: "",
        Grade: "",
        Grade_Point: 0,
        Credits: programCourse.Credits,
      } as any as CsvRow;
    });

    // Step 3: Sort matched program courses according to program order
    const sortedMatched = [...matched].sort((a, b) => {
      const aIndex =
        courseNameToIndex[a.Default_Course_Name?.toLowerCase()?.trim()] ??
        Infinity;
      const bIndex =
        courseNameToIndex[b.Default_Course_Name?.toLowerCase()?.trim()] ??
        Infinity;
      return aIndex - bIndex;
    });

    // Step 4: Extra student courses that were not matched
    const extraStudentCourses = courses.filter((_, i) => !usedIndices.has(i));

    // Step 5: Combine
    const finalTranscript: CsvRow[] = [
      ...sortedMatched,
      ...extraStudentCourses,
    ];

    setCoursesTranscript(finalTranscript);
  };

  // 1️⃣ Sort transcript when sortedProgram changes
  useEffect(() => {
    if (!sortedProgram.length) return;

    // Track used indices to handle duplicates properly
    sortCourses(coursesTranscript);
  }, [sortedProgram]); // runs only when program changes

  // 1️⃣B Sort transcript when new data is loaded from LMS (when coursesTranscript changes)
  useEffect(() => {
    if (isDeleting.current) {
      isDeleting.current = false;
      return;
    }
    if (!coursesTranscript.length || !sortedProgram.length) return;

    // Sort courses whenever transcript is updated (e.g., from LMS)
    sortCourses(coursesTranscript);
  }, [coursesTranscript.length, sortedProgram.length]); // runs when transcript or program length changes

  // 2️⃣ Recalculate scores, unfinished courses, fail whenever transcript changes
  useEffect(() => {
    if (!coursesTranscript.length) return;

    setUnfinishedCourses(
      getUnfinishedCourses(sortedProgram, coursesTranscript),
    );
    calculateScores(coursesTranscript);
    checkFail();
  }, [coursesTranscript, sortedProgram]); // runs when transcript or program changes
  const isDeleting = useRef(false); // Track the delete action

  const handleRemove = (index: number) => {
    isDeleting.current = true; // Set flag before updating state

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

    if (editedRow) {
      const normalizedRow = {
        ...editedRow,
        Credits:
          typeof editedRow.Credits === "string"
            ? parseInt(editedRow.Credits, 10)
            : editedRow.Credits,
      };

      updated[index] = normalizedRow;
    }

    // 1️⃣ Re-sort courses based on program order
    const sortedUpdated = sortUserGrades(selectedProgram, updated);

    // 2️⃣ Recalculate isInProgram for ALL rows
    const withProgramFlags = calculateIsInProgram(
      selectedProgram,
      sortedUpdated,
    );

    // 3️⃣ Update transcript
    setCoursesTranscript(withProgramFlags);

    setEditingIndex(null);
  };

  const calculateIsInProgram = (selectedProgram: any[], users: any[]) => {
    const programCourseNames = new Set(
      selectedProgram.map((course) => course.Course_Name.toLowerCase().trim()),
    );

    return users.map((user) => {
      const userCourseName = (user.Default_Course_Name || "")
        .toLowerCase()
        .trim();

      const isInProgram = userCourseName
        ? Array.from(programCourseNames).some(
            (programName) =>
              programName.includes(userCourseName) ||
              userCourseName.includes(programName),
          )
        : false;

      return {
        ...user,
        isInProgram,
      };
    });
  };

  const calculateScores = (users: any[]) => {
    let totalCredits = 0;
    if (program) {
      totalCredits = sortedProgram?.reduce(
        (sum, course) => sum + (course.Credits || 0),
        0,
      );
    }
    let totalGPA = 0;
    let creditsEarned = 0;
    let creditsToConsider = totalCredits;
    let processedusers = users.map((user: any) => {
      if (
        user["Grade"] !== undefined &&
        user["Grade_Point"] != 0 &&
        user["Grade"] !== "TR" &&
        user["Grade"] !== "RW"
      )
        creditsEarned += user["Credits"];
      //if tr detect from total credits
      if (
        (user["Grade"] !== undefined && user["Grade"] == "TR") ||
        user["Grade"] == "RW"
      ) {
        user["Grade_Point"] = "NA";
        creditsToConsider -= user["Credits"];
      }
      if (
        user["Grade"] !== undefined &&
        user["Grade"] !== "TR" &&
        user["Grade"] !== "RW"
      )
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
            x.Course_Name.toLowerCase().trim() === value.toLowerCase().trim(),
        );

        updatedRow = {
          ...updatedRow, // <-- KEEP existing updates!
          Course_Code: match?.Course_Code || prev["Course_Code"],
          Credits: match?.Credits || prev["Credits"],
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

  const defaultClassCount = coursesTranscript.reduce<Record<string, number>>(
    (acc, row) => {
      const className = row["Default_Course_Name"];
      if (className) acc[className] = (acc[className] || 0) + 1;
      return acc;
    },
    {},
  );
  const isUnfinished = (row: CsvRow) =>
    row["Default_Course_Name"] &&
    unfinishedCourses.some(
      (course) =>
        course.Course_Name.toLowerCase().trim() ===
        row["Default_Course_Name"].toLowerCase().trim(),
    );

  // Function to check if a row is duplicate
  const isDuplicate = (row: CsvRow) =>
    row["Default_Course_Name"] &&
    defaultClassCount[row["Default_Course_Name"]] > 1;
  const compactInfoRowStyle = {
    width: "94%",
    margin: "0 auto",
  };

  if (viewOnly) {
    return (
      <div
        className="transcript-page"
        style={{ width: "100%", maxWidth: "572pt" }}
      >
        <TranscriptPDF
          studentName={studentName}
          program={program}
          enrollmentNo={enrollmentNo}
          coursesTranscript={coursesTranscript}
          unfinishedCourses={unfinishedCourses}
          creditsEarned={creditsEarned}
          totalCredits={totalCredits}
          cumulativeGpa={cumulativeGpa}
          programStatus={programStatus}
          hasFail={hasFail}
          rePrint={rePrint}
          programStart={programStart}
          transcriptPrint={transcriptPrint}
          transcriptRePrint={transcriptRePrint}
        />
      </div>
    );
  }

  return (
    <>
      <TranscriptDiffModal
        isOpen={showDiffModal}
        differences={diffData}
        onClose={() => setShowDiffModal(false)}
      />
      {/* {!viewOnly && (
        <UnfinishedCoursesList unfinishedCourses={unfinishedCourses} />
      )} */}
      {!viewOnly && (
        <div style={{ border: "1px solid", width: "30%" }}>
          <p style={{ fontSize: "20", fontWeight: "bold" }}>
            Course Discrepancy Highlight codes
          </p>
          <ul>
            <li className="duplicate-highlight"> (Duplicate)</li>
            <li className="unfinished-highlight"> (Unfinished)</li>
            <li>Program course</li>
            <li className="notinprogram">
              Random Elective Course - XYZ123 (Not in Program)
            </li>
          </ul>
        </div>
      )}
      {!viewOnly && enrollmentNo && studentName && program && (
        <TranscriptHistory
          studentId={enrollmentNo}
          student_name={studentName}
          program={program}
          selectedProgram={selectedProgram}
          reload={reloadTranscript}
        />
      )}
      <div style={{ marginTop: "20px" }}>
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
          {enrollmentNo && (
            <GetReportButton
              enrollmentNo={enrollmentNo}
              viewOnly={viewOnly}
              reportLoading={reportLoading}
              setReportLoading={setReportLoading}
              setCoursesTranscript={setCoursesTranscript}
              setDiffData={setDiffData}
              setShowDiffModal={setShowDiffModal}
              existingTranscript={coursesTranscript}
            />
          )}{" "}
          {/* <button
            hidden={viewOnly}
            onClick={handleGetReport}
            className="export-button"
            disabled={reportLoading}
          >
            {reportLoading ? "Loading..." : "Get Report From LMS"}
          </button>{" "} */}
          <button
            hidden={viewOnly}
            onClick={markAsTranscriptCreated}
            className="export-button"
          >
            Transcript Created
          </button>
        </div>

      </div>
      <div className="info-row" style={compactInfoRowStyle}>
					<div className="left">
						<span style={{ fontWeight: "550" }}>Student Name</span>: {studentName}
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
        <div className="info-row" style={compactInfoRowStyle}>
					<div className="left">
						<span style={{ fontWeight: "550" }}>Enrollment No:</span>{" "}
						{enrollmentNo}
					</div>
          <TranscriptDate
            label={rePrint ? "Transcript Print Date" : "Program Start Date"}
            hideActions={hideActions}
            programStart={rePrint ? transcriptPrint : programStart}
            setProgramStart={rePrint ? setTranscriptPrint : setProgramStart}
          />
				</div>
        <div className="info-row" style={compactInfoRowStyle}>
					<div className="left">
						{rePrint ? (
							<div className="right">
								<span style={{ fontWeight: "550" }}>Program:</span> {program}
							</div>
						) : null}
					</div>

          <TranscriptDate
            label={rePrint ? "Transcript RePrint Date" : "Transcript Print Date"}
            hideActions={hideActions}
            programStart={rePrint ? transcriptRePrint : transcriptPrint}
            setProgramStart={rePrint ? setTranscriptRePrint : setTranscriptPrint}
          />
				</div>
      <div
        style={{
          textAlign: "center",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <TranscriptEditableTable
          coursesTranscript={coursesTranscript}
          editingIndex={editingIndex}
          editedRow={editedRow}
          hideActions={hideActions}
          courseOptions={courseoptions}
          creditsEarned={creditsEarned}
          totalCredits={totalCredits}
          cumulativeGpa={cumulativeGpa}
          programStatus={programStatus}
          hasFail={hasFail}
          onProgramStatusChange={setProgramStatus}
          onEdit={handleEdit}
          onRemove={handleRemove}
          onSave={handleSave}
          onCancel={() => setEditingIndex(null)}
          onChange={handleChange}
          isDuplicate={isDuplicate}
          isUnfinished={isUnfinished}
        />
      </div>
      {showPrintPreview && (
        <TranscriptPrintTarget
          ref={transcriptRef}
          studentName={studentName}
          program={program}
          enrollmentNo={enrollmentNo}
          coursesTranscript={coursesTranscript}
          unfinishedCourses={unfinishedCourses}
          creditsEarned={creditsEarned}
          totalCredits={totalCredits}
          cumulativeGpa={cumulativeGpa}
          programStatus={programStatus}
          hasFail={hasFail}
          rePrint={rePrint}
          programStart={programStart}
          transcriptPrint={transcriptPrint}
          transcriptRePrint={transcriptRePrint}
        />
      )}
    </>
  );
};

export default GradeTranscript;
