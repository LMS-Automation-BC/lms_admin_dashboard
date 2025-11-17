"use client";
import { useEffect, useState } from "react";
import styles from "./StudentsComponent.module.css";
import StudentModal from "./StudentModal";
import Modal from "./Modal";
import GradeTranscript from "../components/GradeTranscript";
import { getGrade } from "../grades/helpers/grade";

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
  

  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: "filterstudents",
      page: page.toString(),
      limit: limit.toString(),
      ...(searchName && { name: searchName }),
      ...(selectedProgram && { program: selectedProgram }),
      ...(selectedStatus && { status: selectedStatus }),
    });

    fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/student?${params.toString()}`)
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
  }, [page, searchName, selectedProgram, selectedStatus]);

  // Fetch program list once
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/student?type=filters`)
      .then((res) => res.json())
      .then((data) => {
        setProgramsFilter(data.programs);
        setStatusFilter(data.status)
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
  const handleGetGrades = async (student: any) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?studentId=${student.Student_ID}`
      );
      const data = await res.json();
    //   setGrades(data ? calculateGradePoint(data) : []);

      setGradeStudent(student);
    //   setShowGrades(true);
      const query = new URLSearchParams({
        studentName: gradeStudent?.Full_Name,
        program: gradeStudent.Program,
        programStartDate: gradeStudent.CurrentStatus_Start_Date,
        studentId: gradeStudent.Student_ID,
        // selectedProgram: JSON.stringify(transformCourse(gradeStudent.Program)),
        // courses: JSON.stringify(grades),
      }).toString();

      window.open(`/students/transcripts?${query}`, "_blank");
    } catch (err) {
      console.error("Error fetching grades:", err);
      setGrades([]);
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
            <th className={styles.th}>First Name</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student: any) => (
            <tr
              key={student._id}
              onDoubleClick={() => {
                setModalMode("edit");
                setSelectedStudent(student);
                setShowModal(true);
              }}
              className={styles.clickableRow}
            >
              <td className={styles.td}>{student.Full_Name || ""}</td>
              <td className={styles.td}>{student.Student_ID || ""}</td>
              <td className={styles.td}>{student.Program || ""}</td>
              <td className={styles.td}>{student.Current_Status || ""}</td>
              <td className={styles.td}>{student.First_Name_Legal || ""}</td>
              {/* Action Buttons */}
              <td className={styles.td}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEdit(student)}
                >
                  Edit
                </button>

                <button
                  className={styles.actionButton}
                  onClick={() => handleGetGrades(student)}
                >
                  Grades
                </button>
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
      {showGrades && gradeStudent && (
        <Modal onClose={() => setShowGrades(false)}>
          <h2>Grades for {gradeStudent.Full_Name}</h2>
          {/* <GradesTable grades={grades}></GradesTable> */}
          <GradeTranscript
            studentName={gradeStudent?.Full_Name}
            program={gradeStudent.Program}
            programStartDate={new Date().toString()}
            enrollmentNo={gradeStudent?.Student_ID}
            printDate={new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            courses={grades}
            selectedProgram={transformCourse(gradeStudent.Program)}
          ></GradeTranscript>
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
      </div>
    </div>
  );
}

export default StudentsComponent;
