"use client";
import { useEffect, useState } from "react";
import styles from "./StudentsComponent.module.css";
import StudentModal from "./StudentModal";
import Modal from "./Modal";
import GradeTranscript from "../components/GradeTranscript";
import { getGrade } from "../grades/helpers/grade";
import GradeReport from "./GradeReport";
import { AttendanceRecord } from "../dbattendance/page";
import AttendanceReport from "./AttendanceReport";

function StudentsComponent() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [programs, setPrograms] = useState<ProgramsMap>({});
  const [programsFilter, setProgramsFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const [searchNameInput, setSearchNameInput] = useState("");
  const [selectedProgramInput, setSelectedProgramInput] = useState("");
  const [selectedStatusInput, setSelectedStatusInput] = useState("");

  // applied filter states (used in fetch)
  const [searchName, setSearchName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [gradeStudent, setGradeStudent] = useState<any>(null);
  const [showGrades, setShowGrades] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [pageSize, setPageSize] = useState(20); // default 10
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const handlePageSizeChange = (e: any) => {
    setPageSize(Number(e.target.value));
    setPage(1); // reset to first page after changing size
  };
  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: "filterstudents",
      page: page.toString(),
      limit: pageSize.toString(),
      ...(searchName && { name: searchName }),
      ...(selectedProgram && { program: selectedProgram }),
      ...(selectedStatus && { status: selectedStatus }),
    });

    fetch(
      `${
        process.env.NEXT_PUBLIC_FUNCTION_APP_URL
      }/api/student?${params.toString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.data || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  };

  // Fetch students when page or filters change
  useEffect(() => {
    fetchStudents();
  }, [page, searchName, selectedProgram, selectedStatus, pageSize]);

  // Fetch program list once
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/student?type=filters`
    )
      .then((res) => res.json())
      .then((data) => {
        setProgramsFilter(data.programs);
        setStatusFilter(data.status);
        fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`)
          .then((res) => res.json())
          .then((data) => {
            localStorage.setItem("programs", JSON.stringify(data));
          });
      })
      .catch((err) => {
        console.error("Failed to fetch programs", err);
      });
  }, []);

  // Local state changes as user types/selects
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchNameInput(e.target.value);
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProgramInput(e.target.value);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatusInput(e.target.value);
  };
  //value={selectedStatusInput}
  //onChange={handleStatusChange}
  const handleApplyFilters = () => {
    setSearchName(searchNameInput);
    setSelectedProgram(selectedProgramInput);
    setSelectedStatus(selectedStatusInput);
    setPage(1); // reset pagination when applying filters
  };
  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleSaveStudent = (data: any) => {
    const method = modalMode === "add" ? "POST" : "PUT";
    const url =
      modalMode === "add"
        ? `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/student`
        : `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/student`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        setShowModal(false);
        fetchStudents();
      })
      .catch((err) => console.error("Save error:", err));
  };

  const handleEdit = (student: any) => {
    setModalMode("edit");
    setSelectedStudent(student);
    setShowModal(true);
  };
  const transformCourse = (program: string) => {
    let raw = programs[program];
    return raw.map((x) => {
      return {
        courseCode: x.Course_Code,
        courseName: x.Course_Name,
        credits: x.Credits,
        // You can map optional fields if your data has them
        letterGrade: x.Last_Attempt || undefined,
        gradePoints: undefined, // or map from another field if available
      };
    });
  };
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const handleGetAttendance = async (student: { Full_Name: string }) => {
  try {
    setShowAttendance(true);
    setGradeStudent(student);

    const params = new URLSearchParams({
      type: "data",
      name: student.Full_Name,
      absentOnly: "false",
      page: "1",
      limit: "1000",
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/attendance?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed to fetch attendance");

    const response = await res.json();
    setAttendanceData(response.data || []);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    setAttendanceData([]); // optional: clear previous data on error
  }
};

  const handleGetRawGrades = async (student: any) => {
    setShowGrades(true);
    setLoadingStudentId(student.Student_ID);
    // setLoading(true);
    setGradeStudent(student);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?studentId=${student.Student_ID}`
      );
      if (!res.ok) throw new Error("Failed to fetch grades");
      const data = await res.json();
      setGrades(data); // assume API returns Course[] type
    } catch (err: any) {
      setGrades([]);
    } finally {
      setLoadingStudentId(null);
      setLoading(false);
    }
  };
  const handleGetGrades = async (student: any) => {
    try {
      // setLoadingStudentId(student.Student_ID);
      // const res = await fetch(
      //   `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?studentId=${student.Student_ID}`
      // );
      // const data = await res.json();

      setGradeStudent(student); // keep this if needed elsewhere

      const query = new URLSearchParams({
        sisId: student.sisId,
        studentName: student.Full_Name,
        program: student.Program,
        programStartDate: student.CurrentStatus_Start_Date,
        studentId: student.Student_ID,
      }).toString();

      window.open(`/students/transcripts?${query}`, "_blank");
    } catch (err) {
      console.error("Error fetching grades:", err);
      setGrades([]);
    } finally {
      setLoadingStudentId(null); // stop loading
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1>Students</h1>

      {/* 🔍 Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchNameInput}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        <select
          value={selectedProgramInput}
          onChange={handleProgramChange}
          className={styles.select}
        >
          <option value="">All Programs</option>
          {programsFilter.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>
        <select
          value={selectedStatusInput}
          onChange={handleStatusChange}
          className={styles.select}
        >
          <option value="">All Status</option>
          {statusFilter.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>
        <button className={styles.searchButton} onClick={handleApplyFilters}>
          Search
        </button>
      </div>
      <button
        onClick={() => {
          setModalMode("add");
          setSelectedStudent(null);
          setShowModal(true);
        }}
        className={styles.addButton}
      >
        ➕ Add Student
      </button>

      {/* 📋 Table */}
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Full Name</th>
            <th className={styles.th}>Student ID</th>
            <th className={styles.th}>Program</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>SIS/LMS</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student: any, index: number) => (
            <tr
              key={student._id ?? student.Student_ID ?? index}
              onDoubleClick={() => {
                setModalMode("edit");
                setSelectedStudent(student);
                setShowModal(true);
              }}
              className={styles.clickableRow}
            >
              <td className={styles.td}>
                <span>{student.Full_Name || ""}</span>

                
              </td>

              <td className={styles.td}>{student.Student_ID || ""}</td>
              <td className={styles.td}>{student.Program || ""}</td>
              <td className={styles.td}>{student.Current_Status || ""}</td>
              <td className={styles.td}>{/* SIS (S icon) */}
                <a
                  href={`https://brookescollege.classe365.com/1/admin/students/view/${student.sisId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconBadge} ${styles.sisBadge}`}
                  title="Open SIS"
                >
                  SIS
                </a>

                {/* LMS (L icon) */}
                <a
                  href={`https://brookescollege.neolms.com/user/show/${student.LMS_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconBadge} ${styles.lmsBadge}`}
                  title="Open LMS"
                >
                  LMS
                </a>
                </td>
              {/* Action Buttons */}
              <td className={styles.td}>
                 <button
                  className={`${styles.iconButton} ${styles.editButton}`}
                  onClick={() => handleEdit(student)}
                  title="Edit"
                >
                  ✏️
                </button>
                {/* Grouped Grades Buttons */}
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.iconButton} ${styles.gradesButton}`}
                    disabled={loadingStudentId === student.Student_ID}
                    onClick={() => handleGetGrades(student)}
                    title="Grades"
                  >
                    📊 Transcript
                  </button>
                
                  <button
                    className={`${styles.iconButton} ${styles.reportButton}`}
                    disabled={loadingStudentId === student.Student_ID}
                    onClick={() => handleGetRawGrades(student)}
                    title="Grades Report"
                  >
                    🏅Report
                  </button>
                  <button
                    className={`${styles.iconButton} ${styles.reportButton}`}
                    disabled={loadingStudentId === student.Student_ID}
                    onClick={() => handleGetAttendance(student)}
                    title="Attendance Report"
                  >
                    🗓️ Report
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <StudentModal
          mode={modalMode}
          student={selectedStudent}
          grades={grades}
          onClose={() => setShowModal(false)}
          onSave={handleSaveStudent}
        />
      )}
      {showGrades && (
        <Modal onClose={() => setShowGrades(false)}>
          <h2>Grades for {gradeStudent.Full_Name}</h2>
          {/* <GradesTable grades={grades}></GradesTable> */}
          <GradeReport
            courses={grades}
            studentName={gradeStudent.Full_Name}
            student_ID={gradeStudent.Student_ID}
          />
        </Modal>
      )}
      {showAttendance && (
        <Modal onClose={() => setShowAttendance(false)}>
          <h2>Attendance for {gradeStudent.Full_Name}</h2>
          {/* <GradesTable grades={grades}></GradesTable> */}
          <AttendanceReport
            data={attendanceData}
            studentName={gradeStudent.Full_Name}
            student_ID={gradeStudent.Student_ID}
          />
        </Modal>
      )}
      {/* 🔁 Pagination Controls */}
      <div className={styles.pagination}>
        <button onClick={prevPage} disabled={page === 1}>
          ◀ Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={page === totalPages}>
          Next ▶
        </button>
        <div className={styles.pageSizeSelector}>
          <span>Page size:</span>
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default StudentsComponent;
