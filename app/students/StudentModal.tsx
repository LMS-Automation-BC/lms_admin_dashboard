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
    CurrentStatus_Amended_End_Date_1: "CurrentStatus Amended End Date 1",
    CurrentStatus_Amended_End_Date_1_NA: "CurrentStatus Amended End Date 1 NA",
    CurrentStatus_Amended_End_Date_1_NVAT:
      "CurrentStatus Amended End Date 1 NeverAttended",
    CurrentStatus_Amended_End_Date_2: "CurrentStatus Amended End Date 2",
    CurrentStatus_Amended_End_Date_2_NA: "CurrentStatus Amended End Date 2 NA",
    CurrentStatus_Amended_End_Date_2_NR:
      "CurrentStatus Amended End Date 2 Not Required",
    CurrentStatus_Actual_End_Date_3: "CurrentStatus Actual End Date 3",
    CurrentStatus_Actual_End_Date_3_NA: "CurrentStatus Actual End Date 3 NA",
    CurrentStatus_Actual_End_Date_3_NR:
      "CurrentStatus Actual End Date 3 Not Required",
    CurrentStatus_Actual_End_Date_4: "CurrentStatus Actual End Date 4",
    CurrentStatus_Actual_End_Date_4_NA: "CurrentStatus Actual End Date 4 NA",
    CurrentStatus_Actual_End_Date_4_NR:
      "CurrentStatus Actual End Date 4 Not Required",
    CurrentStatus_Actual_End_Date_5: "CurrentStatus Actual End Date 5",
    CurrentStatus_Actual_End_Date_6: "CurrentStatus Actual End Date 6",

    ASIST_Status: "ASIST Status",
    ASIST_Completed_Date: "ASIST Completed Date",
    ASIST_Expiry: "ASIST Expiry",
    CPR_Status: "CPR Status",
    CPR_Completion_Date: "CPR Completion Date",
    CPR_Completion_Date_NA: "CPR Completion Date NA",
    CPR_Completion_Date_NR: "CPR Completion Date Not Required",
    CPR_Expiry_Date: "CPR Expiry Date",
    CPR_Notes: "CPR Notes",
    CPR_Expiry_Date_NA: "CPR Expiry Date NA",
    CPR_Expiry_Date_NR: "CPR Expiry Date Not Required",
    CurrentStatus_Practicum_Provider: "CurrentStatus Practicum Provider",
    COE: "COE",
    Current_Employer: "Current Employer",
    Position_Job_Title: "Job Title",
    Work_Address: "Work Address",
    CurrentStatus_Notes_Comments: "CurrentStatus Notes Comments",
    Tuition_Remarks: "Tuition_Remarks",
    CurrentStatus_Withdrawal_Status: "CurrentStatus Withdrawal Status",
    Withdrawals_Processed_On: "Withdrawals Processed On",
    Withdrawals_Processed_On_NA: "Withdrawals Processed On NA",
    WithdrawnStatus_Joining_Date_COR: "WithdrawnStatus Joining Date COR",
    WithdrawnStatus_Joining_Date_COR_NA: "WithdrawnStatus Joining Date COR NA",
    LAST_DATE_of_Attendance: "LAST DATE of Attendance",
    LAST_DATE_of_Attendance_NVAT: "LAST DATE of Attendance Never Attended",
    Days_Attended: "Days Attended",
    WithdrawnStatus_Hours_as_of_LDA: "WithdrawnStatus Hours :of LDA",
    WithdrawnStatus_Program_Completion_Percent:
      "WithdrawnStatus Program Completion Percent",
    WithdrawnStatus_Total_Tuition: "WithdrawnStatus Total Tuition",
    WithdrawnStatus_Tuition_Received: "WithdrawnStatus Tuition Received",
    WithdrawnStatus_Retaining_Funds: "WithdrawnStatus Retaining Funds",
    WithdrawnStatus_Resources_Computer: "WithdrawnStatus Resources Computer",
    WithdrawnStatus_Registration_Fee: "WithdrawnStatus Registration Fee",
    WithdrawnStatus_Refund_Amount: "WithdrawnStatus Refund Amount",
    WithdrawnStatus_Laptop_Received: "WithdrawnStatus Laptop Received",
    Withdrawn_Status: "Withdrawn Status",
    Reason_for_Termination: "Reason for Termination",
    AcademicStatus_Failed_Courses: "AcademicStatus Failed Courses",
    Academic_Warning_Email: "Academic Warning Email",
    AcademicStatus_Note: "AcademicStatus Note",
    Graduation_Attendance: "Graduation Attendance",
    Diploma_Issued_Exit_Form: "Diploma Issued Exit Form",
    Employment_Assistance_Required: "Employment Assistance Required",
    SL_Financial_Exit_Interview_Form: "SL Financial Exit Interview Form",
    Diploma_Issued_Month: "Diploma Issued Month",
    Diploma_Mailing_Address: "Diploma Mailing Address",
    Diploma_Issued_City: "Diploma Issued City",
    Diploma_Issued_Tuition_Verification: "Diploma Issued Tuition Verification",
    Diploma_Issued_Status: "Diploma Issued Status",
    Student_Loan_Study_Period_End_Date: "Student Loan Study Period End Date",
    CAN_Loan_Due_Date: "CAN Loan Due Date",
    AB_Loan_Due_Date: "AB Loan Due Date",
    AB_Loan_Due_Date_NA: "AB Loan Due Date NA",
    AB_Loan_Due_Date_NR: "AB Loan Due Date Not Received",
    National_Student_Loan: "National Student Loan",
    AB_Student_Loan: "AB Student Loan",
    TranscriptList_Status: "TranscriptList Status",
    TranscriptList_Print_Date: "TranscriptList Print Date",
    TranscriptList_Notes: "TranscriptList Notes",
    sisId: "sisId",
    LMS_ID: "LMS ID",
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
        "Current_Employer",
        "Position_Job_Title",
        "Work_Address",
      ],
    },
    {
      title: "Current Status",
      fields: [
        "Current_Status",
        "CurrentStatus_Start_Date",
        "CurrentStatus_End_Date",
        "CurrentStatus_Amended_End_Date_1",
        "CurrentStatus_Amended_End_Date_1_NA",
        "CurrentStatus_Amended_End_Date_1_NVAT",
        "CurrentStatus_Amended_End_Date_2",
        "CurrentStatus_Amended_End_Date_2_NA",
        "CurrentStatus_Amended_End_Date_2_NR",
        "CurrentStatus_Actual_End_Date_3",
        "CurrentStatus_Actual_End_Date_3_NA",
        "CurrentStatus_Actual_End_Date_3_NR",
        "CurrentStatus_Actual_End_Date_4",
        "CurrentStatus_Actual_End_Date_4_NA",
        "CurrentStatus_Actual_End_Date_4_NR",
        "CurrentStatus_Actual_End_Date_5",
        "CurrentStatus_Actual_End_Date_6",
        "CurrentStatus_Practicum_Provider",
        "Tuition_Remarks",
        "COE",
        "CurrentStatus_Notes_Comments",
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
        "CPR_Completion_Date_NA",
        "CPR_Completion_Date_NR",
        "CPR_Expiry_Date",
        "CPR_Expiry_Date_NA",
        "CPR_Expiry_Date_NR",
        "CPR_Notes",
      ],
    },
    {
      title: "Withdrawn/Terminated",
      fields: [
        "Reason_for_Termination",
        "CurrentStatus_Withdrawal_Status",
        "Withdrawals_Processed_On",
        "Withdrawals_Processed_On_NA",
        "WithdrawnStatus_Joining_Date_COR",
        "WithdrawnStatus_Joining_Date_COR_NA",

        "WithdrawnStatus_Hours_as_of_LDA",
        "WithdrawnStatus_Program_Completion_Percent",
        "WithdrawnStatus_Total_Tuition",
        "WithdrawnStatus_Tuition_Received",
        "WithdrawnStatus_Retaining_Funds",
        "WithdrawnStatus_Resources_Computer",
        "WithdrawnStatus_Registration_Fee",
        "WithdrawnStatus_Refund_Amount",
        "WithdrawnStatus_Laptop_Received",
        "Withdrawn_Status",
      ],
    },
    {
      title: "Attendance & Others",
      fields: [
        "LAST_DATE_of_Attendance",
        "LAST_DATE_of_Attendance_NVAT",
        "Days_Attended",
        "AcademicStatus_Failed_Courses",
        "Academic_Warning_Email",
        "AcademicStatus_Note",
        "Graduation_Attendance",
        "Diploma_Issued_Exit_Form",
        "Employment_Assistance_Required",
        "SL_Financial_Exit_Interview_Form",
      ],
    },
    {
      title: "Diploma",
      fields: [
        "Diploma_Issued_Month",
        "Diploma_Mailing_Address",
        "Diploma_Issued_City",
        "Diploma_Issued_Tuition_Verification",
        "Diploma_Issued_Status",
      ],
    },
    {
      title: "Loan",
      fields: [
        "Student_Loan_Study_Period_End_Date",
        "CAN_Loan_Due_Date",
        "AB_Loan_Due_Date",
        "AB_Loan_Due_Date_NA",
        "AB_Loan_Due_Date_NR",
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
                    const isDate =
                      (field.toLowerCase().includes("date") ||
                        field === "Withdrawals_Processed_On" ||
                        field.toLowerCase().includes("dob_yyyy") ||
                        field.toLowerCase().includes("month")) &&
                      !field.toLowerCase().includes("_na") &&
                      !field.toLowerCase().includes("_nr") &&
                      !field.toLowerCase().includes("_nvat");
                    const isbool =
                      field.endsWith("_NA") ||
                      field.endsWith("_NR") ||
                      field.endsWith("_NVAT");
                    const isNotes = field.toLowerCase().includes("notes");
                    return (
                      <div className={styles.formGroup} key={field}>
                        <label>
                          {fieldLabels[field] || field.replace(/_/g, " ")}
                        </label>
                        {isNotes ? (
                          <textarea
                            className={styles.notestextarea}
                            value={formData[field] ?? ""}
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                          />
                        ) : field.toLowerCase().includes("percent") ? (
                          <div className={styles.percentWrapper}>
                            <input
                              type={
                                isbool ? "checkbox" : isDate ? "date" : "text"
                              }
                              value={
                                isDate && formData[field]
                                  ? formData[field].split("T")[0]
                                  : (formData[field] ?? "")
                              }
                              onChange={(e) =>
                                handleChange(field, e.target.value)
                              }
                            />
                            <span className={styles.percent}>%</span>
                          </div>
                        ) : (
                          <input
                            type={
                              isbool ? "checkbox" : isDate ? "date" : "text"
                            }
                            value={
                              isDate && formData[field]
                                ? formData[field].split("T")[0]
                                : (formData[field] ?? "")
                            }
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                          />
                        )}

                        {/* Show warning only for SIS ID */}
                        {field === "sisId" && changedSIS && formData.sisId && (
                          <>
                            <p
                              style={{
                                color: "red",
                                fontSize: "13px",
                                marginTop: "4px",
                              }}
                            >
                              Make sure you verify the student by clicking on
                              the link as you changed SIS Id
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
                        {field === "LMS_ID" &&
                          changedLMS &&
                          formData.LMS_ID && (
                            <>
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "13px",
                                  marginTop: "4px",
                                }}
                              >
                                Make sure you verify the student by clicking on
                                the link as you changed LMS Id
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
