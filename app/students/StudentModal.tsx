"use client";
import { useState, useEffect } from "react";
import styles from "./StudentModal.module.css";

interface StudentModalProps {
  mode: "add" | "edit";
  student?: any;
  onClose: () => void;
  onSave: (studentData: any) => void;
}

const StudentModal = ({
  mode,
  student,
  onClose,
  onSave,
}: StudentModalProps) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [changedLMS, setChangedLMS] = useState(false);
  const [changedSIS, setChangedSIS] = useState(false);

  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({ ...student });
    } else {
      setFormData({});
    }
  }, [mode, student]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "LMS_ID") setChangedLMS(value !== student?.LMS_ID);
    if (field === "sisId") setChangedSIS(value !== student?.sisId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  const formatDateForInput = (value: string) => {
    if (!value) return "";
    // take first 10 chars and trim spaces
    return value.trim().slice(0, 10);
  };
  // Labels for clean display
  const fieldLabels: { [key: string]: string } = {
    Full_Name: "Full Name",
    First_Name_Legal: "First Name (Legal)",
    Last_Name: "Last Name",
    DOB_YYYYMMDD: "Date of Birth",
    Phone_Number_Cell: "Cell Phone",
    Email_Address: "Email Address",
    Mailing_Address: "Mailing Address",
    City: "City",
    Province: "Province",
    Postal_Code: "Postal Code",
    Program: "Program",
    Batch: "Batch",
    Student_ID: "Student ID",
    Current_Status: "Current Status",
    CurrentStatus_Start_Date: "Start Date",
    CurrentStatus_End_Date: "End Date",
    Current_Employer: "Current Employer",
    Position_Job_Title: "Job Title",
    Work_Address: "Work Address",
    ASIST_Status: "ASIST Status",
    ASIST_Completed_Date: "ASIST Completed Date",
    ASIST_Expiry: "ASIST Expiry",
    CPR_Status: "CPR Status",
    CPR_Completion_Date: "CPR Completion Date",
    CPR_Expiry_Date: "CPR Expiry Date",
    CPR_Notes: "CPR Notes",
    Diploma_Issued_Month: "Diploma Issued Month",
    Diploma_Issued_Status: "Diploma Status",
    LMS_ID: "LMS ID",
    sisId: "SIS ID",
    // Add other mappings as needed
  };

  // Groups
  const groups: { title: string; fields: string[] }[] = [
    {
      title: "Personal Info",
      fields: [
        "Full_Name",
        "First_Name_Legal",
        "Last_Name",
        "DOB_YYYYMMDD",
        "Phone_Number_Cell",
        "Email_Address",
        "Mailing_Address",
        "City",
        "Province",
        "Postal_Code",
        "Program",
        "Batch",
        "Student_ID",
      ],
    },
    {
      title: "Current Status",
      fields: [
        "Current_Status",
        "CurrentStatus_Start_Date",
        "CurrentStatus_End_Date",
        "Current_Employer",
        "Position_Job_Title",
        "Work_Address",
      ],
    },
    {
      title: "ASIST",
      fields: ["ASIST_Status", "ASIST_Completed_Date", "ASIST_Expiry"],
    },
    {
      title: "CPR",
      fields: [
        "CPR_Status",
        "CPR_Completion_Date",
        "CPR_Expiry_Date",
        "CPR_Notes",
      ],
    },
    {
      title: "Diploma",
      fields: ["Diploma_Issued_Month", "Diploma_Issued_Status"],
    },
    {
      title: "Loan",
      fields: [
        "CAN_Loan_Due_Date",
        "AB_Loan_Due_Date",
        "National_Student_Loan",
        "AB_Student_Loan",
      ],
    },
    { title: "LMS & SIS", fields: ["LMS_ID", "sisId"] },
    {
      title: "Transcript",
      fields: [
        "TranscriptList_Status",
        "TranscriptList_Print_Date",
        "TranscriptList_Notes",
      ],
    },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {mode === "add" ? "Add Student" : "Edit Student"}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.groupsGrid}>
            {groups.map((group) => (
              <fieldset key={group.title} className={styles.groupFieldset}>
                <legend className={styles.groupLegend}>{group.title}</legend>
                <div className={styles.groupGrid}>
                 {group.fields.map((field) => {
  if (!(field in formData)) formData[field] = "";
  const isDate = field.toLowerCase().includes("date");

  return (
    <div className={styles.formGroup} key={field}>
      <label>{fieldLabels[field] || field.replace(/_/g, " ")}</label>
      <input
        type={isDate ? "date" : "text"}
        value={isDate ? formatDateForInput(formData[field]) : formData[field] ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
      />

      {/* Show warning only for SIS ID */}
      {field === "sisId" && changedSIS && formData.sisId && (
        <>
          <p style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
            Make sure you verify the student by clicking on the link as you changed SIS Id
          </p>
          <div className={styles.confirmLink}>
            Confirm SIS ID:{" "}
            <a
              href={`https://brookescollege.classe365.com/1/admin/students/view/${formData.sisId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify SIS
            </a>
          </div>
        </>
      )}

      {/* Show warning only for LMS ID */}
      {field === "LMS_ID" && changedLMS && formData.LMS_ID && (
        <>
          <p style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
            Make sure you verify the student by clicking on the link as you changed LMS Id
          </p>
          <div className={styles.confirmLink}>
            Confirm LMS ID:{" "}
            <a
              href={`https://brookescollege.neolms.com/user/show/${formData.LMS_ID}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify LMS
            </a>
          </div>
        </>
      )}
    </div>
  );
})}

                </div>
              </fieldset>
            ))}
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.discardButton}
              onClick={onClose}
            >
              Discard Changes
            </button>
            <button type="submit" className={styles.submitButton}>
              {mode === "add" ? "Add Student" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
