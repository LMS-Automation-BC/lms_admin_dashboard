"use client";

import CreatableSelect from "react-select/creatable";
import { FiCheck, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { CsvRow } from "@/app/components/GradeParser";
import { extractMonthYear, gradeScale } from "@/app/grades/helpers/grade";

type CourseOption = {
  value: string;
  label: string;
};

interface TranscriptEditableTableProps {
  coursesTranscript: CsvRow[];
  editingIndex: number | null;
  editedRow: CsvRow | undefined;
  hideActions: boolean;
  courseOptions: CourseOption[];
  creditsEarned: number;
  totalCredits: number;
  cumulativeGpa: number;
  programStatus: string;
  hasFail: boolean;
  onProgramStatusChange: (value: string) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onSave: (index: number) => void;
  onCancel: () => void;
  onChange: (field: keyof CsvRow, value: string) => void;
  isDuplicate: (row: CsvRow) => boolean;
  isUnfinished: (row: CsvRow) => boolean;
}

export default function TranscriptEditableTable({
  coursesTranscript,
  editingIndex,
  editedRow,
  hideActions,
  courseOptions,
  creditsEarned,
  totalCredits,
  cumulativeGpa,
  programStatus,
  hasFail,
  onProgramStatusChange,
  onEdit,
  onRemove,
  onSave,
  onCancel,
  onChange,
  isDuplicate,
  isUnfinished,
}: TranscriptEditableTableProps) {
  if (!coursesTranscript.length) {
    return null;
  }

  return (
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
                    value={isEditing && editedRow ? editedRow["Course_Code"] : ""}
                    onChange={(e) => onChange("Course_Code", e.target.value)}
                  />
                ) : (
                  row["Course_Code"] || row["Course_Code"]
                )}
              </td>
              <td
                title={row["Course_Name"]}
                className={`course-name ${
                  isDuplicate(row)
                    ? "duplicate-highlight"
                    : isUnfinished(row) && !hideActions
                      ? "unfinished-highlight"
                      : row.isInProgram === false && !hideActions
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
                      onChange(
                        "Default_Course_Name",
                        selectedOption?.value || "",
                      )
                    }
                    options={courseOptions}
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
                    value={editedRow?.["Last_Attempt"] || ""}
                    onChange={(e) => onChange("Last_Attempt", e.target.value)}
                  />
                ) : (
                  (() => {
                    const value = row["Last_Attempt"] ?? row["Semester"];
                    return value ? extractMonthYear(value) : "";
                  })()
                )}
              </td>
              <td className="credits">
                {isEditing ? (
                  <input
                    value={isEditing && editedRow ? editedRow["Credits"] : ""}
                    onChange={(e) => onChange("Credits", e.target.value)}
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
                    onChange={(e) => onChange("Grade", e.target.value)}
                  >
                    <option value="">Select Grade</option>
                    {gradeScale.map((item) => (
                      <option key={item.grade} value={item.grade}>
                        {item.grade}
                      </option>
                    ))}
                    <option key="TR" value="TR">
                      TR
                    </option>
                    <option key="RW" value="RW">
                      RW
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
                      <button onClick={() => onSave(index)} className="button small">
                        <FiCheck />
                      </button>
                      <button onClick={onCancel} className="button small danger">
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(index)}
                        className="button small"
                        title="Edit course"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onRemove(index)}
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
            <td colSpan={!hideActions ? 3 : 2} style={{ textAlign: "center" }}>
              {creditsEarned}
            </td>
          </tr>
        ) : null}
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            Total Credits
          </td>
          <td colSpan={!hideActions ? 3 : 2} style={{ textAlign: "center" }}>
            {totalCredits}
          </td>
        </tr>
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            Cumulative Grade Point Average (CGPA)
          </td>
          <td colSpan={!hideActions ? 3 : 2} style={{ textAlign: "center" }}>
            {(Math.round(cumulativeGpa * 1000) / 1000).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            Program Status {hasFail}
          </td>
          <td colSpan={!hideActions ? 3 : 2} style={{ textAlign: "center" }}>
            {hideActions ? (
              programStatus || "Completed"
            ) : (
              <select
                value={programStatus}
                onChange={(e) => onProgramStatusChange(e.target.value)}
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
  );
}