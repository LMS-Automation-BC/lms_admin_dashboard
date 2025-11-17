"use client";

import React, { useEffect, useState } from "react";
import "./programs.css";
import { FiBook, FiPlusCircle, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";

// interface Course {
//   courseCode: string;
//   courseName: string;
//   credits: number;
//   id?:number;
// }

// interface ProgramsMap {
//   [programName: string]: Course[];
// }

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramsMap>({});
  const [newProgramName, setNewProgramName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  // Course form state (for adding new course from new program)
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState<number | "">("");
    // Course form state (for adding new course to existing program)
  const [courseCodeEP, setCourseCodeEP] = useState("");
  const [courseNameEP, setCourseNameEP] = useState("");
  const [creditsEP, setCreditsEP] = useState<number | "">("");

  // Editing state
  const [editingCourseCode, setEditingCourseCode] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseId, setEditCourseId] = useState<number|null>(null);
  const [editCredits, setEditCredits] = useState<number | "">("");
  const [editingProgramName, setEditingProgramName] = useState(false);
  const [editProgramName, setEditProgramName] = useState("");
  const [loading, setLoading] = useState(false);
  // Fetch programs on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`)
      .then((res) => res.json())
      .then(data => {
        setLoading(false);
        setPrograms(data)})
      .catch(console.error);
  }, []);

  // Add new program
  const handleAddProgram = async () => {
    const trimmedName = newProgramName.trim();
    if (!trimmedName) return alert("Program name can't be empty");
    if (programs[trimmedName]) return alert("Program already exists");
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( { program: trimmedName, courseCode,courseName,credits}),
    });
    if (res.ok) {
      const data = await res.json() as any;
      const updated = { ...programs, [trimmedName]: [{Course_Code:courseCode,Course_Name:courseName,Credits:credits,id:data.insertedId}as Course] };
      setPrograms(updated);
      setNewProgramName("");
      setCourseCode("");
      setCourseName("");
      setCredits("");
    }
  };

  // Add new course to selected program
  const handleAddCourse = async () => {
    if (!selectedProgram) return alert("Select a program first");
    if (!courseCodeEP.trim() || !courseNameEP.trim() || creditsEP === "") {
      return alert("Fill all course fields");
    }

    const newCourse: Course = {
      Course_Code: courseCodeEP.trim(),
      Course_Name: courseNameEP.trim(),
      Credits: Number(creditsEP),
    };

    const updatedCourses = [...(programs[selectedProgram] || []), newCourse];

    const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program: selectedProgram,
        courseCode: courseCodeEP,
        courseName: courseNameEP,
        credits:creditsEP,
      }),
    });

    if (res.ok) {
      setPrograms((prev) => ({
        ...prev,
        [selectedProgram]: updatedCourses,
      }));
      setCourseCodeEP("");
      setCourseNameEP("");
      setCreditsEP("");
    } else {
      alert("Failed to add course");
    }
  };

  // Delete entire program
  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    if (!confirm(`Delete program "${selectedProgram}"? This action cannot be undone.`))
      return;

    const updatedPrograms = { ...programs };
    delete updatedPrograms[selectedProgram];

    const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program?name=`+selectedProgram, {
      method: "delete",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setPrograms(updatedPrograms);
      setSelectedProgram(null);
    } else {
      alert("Failed to delete program");
    }
  };

  // Start editing a course
  const startEditing = (course: Course) => {
    setEditingCourseCode(course.Course_Code);
    setEditCourseName(course.Course_Name);
    setEditCredits(course.Credits);
    if (course.id) setEditCourseId(course.id)
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCourseCode(null);
    setEditCourseName("");
    setEditCredits("");
    setEditCourseId(null)
  };

  // Save edited course
  const saveEdit = async () => {
  if (!selectedProgram || !editingCourseCode) return;

  if (!editCourseName.trim() || editCredits === "") {
    return alert("Fill all course fields");
  }

  // Create the updated course
  const updatedCourse: Course = {
    Course_Code: editingCourseCode,
    Course_Name: editCourseName.trim(),
    Credits: Number(editCredits),
    id: editCourseId || undefined,
  };

  // Send only the updated course to the backend
  const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      programName: selectedProgram,
      course: updatedCourse, // 👈 send only one course
    }),
  });

  if (res.ok) {
    // Update the course locally
    setPrograms((prev) => ({
      ...prev,
      [selectedProgram]: prev[selectedProgram].map((course) =>
        course.Course_Code === editingCourseCode ? updatedCourse : course
      ),
    }));
    cancelEditing();
  } else {
    alert("Failed to save course");
  }
};


  // Delete a course
  const deleteCourse = async (courseCodeToDelete: string, id:number) => {
    if (!selectedProgram) return;
    if (!confirm(`Delete course ${courseCodeToDelete} from ${selectedProgram}?`)) return;

    const updatedCourses = programs[selectedProgram].filter(
      (course) => course.Course_Code !== courseCodeToDelete
    );

    const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program?courseid=`+id, {
      method: "delete",
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      setPrograms((prev) => ({
        ...prev,
        [selectedProgram]: updatedCourses,
      }));
    } else {
      alert("Failed to delete course");
    }
  };
  if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  return (
    <main className="container">
      <h1 className="programstitle">
        <FiBook className="icon" /> Programs and Courses
      </h1>

      {/* Add New Program */}
    <section className="add-section">
  <h2>Add New Program</h2>

  {/* Program name */}
  <input
    type="text"
    placeholder="Program Name"
    value={newProgramName}
    onChange={(e) => setNewProgramName(e.target.value)}
    className="input"
  />

  {/* Course details */}
  <div className="course-form">
    <input
      type="text"
      placeholder="Course Code"
      value={courseCode}
      onChange={(e) => setCourseCode(e.target.value)}
      className="input"
    />
    <input
      type="text"
      placeholder="Course Name"
      value={courseName}
      onChange={(e) => setCourseName(e.target.value)}
      className="input"
    />
    <input
      type="number"
      min={0}
      placeholder="Credits"
      value={credits}
      onChange={(e) =>
        setCredits(e.target.value === "" ? "" : Number(e.target.value))
      }
      className="input"
    />
  </div>

  {/* Button */}
  <button
    onClick={handleAddProgram}
    className="button"
    disabled={
      !newProgramName.trim() ||
      !courseCode.trim() ||
      !courseName.trim() ||
      credits === "" ||
      credits <= 0
    }
  >
    Add Program
  </button>
</section>


      {/* Select Program and Delete */}
     <section className="add-section">
  <h2>Select Program</h2>
  <select
    value={selectedProgram || ""}
    onChange={(e) => {
      if (editingProgramName) {
        if (!confirm("Discard unsaved program name changes?")) return;
        setEditingProgramName(false);
      }
      setSelectedProgram(e.target.value || null);
    }}
    className="select"
    disabled={editingProgramName}
  >
    <option value="">-- Select Program --</option>
    {Object.keys(programs).map((prog) => (
      <option key={prog} value={prog}>
        {prog}
      </option>
    ))}
  </select>

  {selectedProgram && !editingProgramName && (
    <>
      <button
        onClick={() => {
          setEditingProgramName(true);
          setEditProgramName(selectedProgram);
        }}
        className="button"
        style={{ marginLeft: "1rem" }}
        title="Edit Program Name"
      >
        <FiEdit2 />
      </button>

      <button
        onClick={handleDeleteProgram}
        className="button danger"
        style={{ marginLeft: "1rem" }}
      >
        <FiTrash2 style={{ marginRight: "0.3rem" }} />
        Delete Program
      </button>
    </>
  )}

  {selectedProgram && editingProgramName && (
    <>
      <input
        type="text"
        value={editProgramName}
        onChange={(e) => setEditProgramName(e.target.value)}
        className="input"
        style={{ marginLeft: "1rem", width: "15rem" }}
      />
      <button
        onClick={async () => {
          const trimmed = editProgramName.trim();
          if (!trimmed) return alert("Program name can't be empty");
          if (trimmed === selectedProgram) {
            // no change
            setEditingProgramName(false);
            return;
          }
          if (programs[trimmed]) {
            return alert("Program name already exists");
          }
          // Rename the program key
          const updatedPrograms: ProgramsMap = {};
          Object.entries(programs).forEach(([key, courses]) => {
            if (key === selectedProgram) {
              updatedPrograms[trimmed] = courses;
            } else {
              updatedPrograms[key] = courses;
            }
          });

          const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPrograms),
          });

          if (res.ok) {
            setPrograms(updatedPrograms);
            setSelectedProgram(trimmed);
            setEditingProgramName(false);
          } else {
            alert("Failed to rename program");
          }
        }}
        className="button small"
        style={{ marginLeft: "0.5rem" }}
        title="Save"
      >
        <FiCheck />
      </button>
      <button
        onClick={() => setEditingProgramName(false)}
        className="button small danger"
        style={{ marginLeft: "0.5rem" }}
        title="Cancel"
      >
        <FiX />
      </button>
    </>
  )}
</section>

      {/* Add Course Form */}
      {selectedProgram && (
        <section className="add-section">
          <h2>Add Course to {selectedProgram}</h2>
          <div className="course-form">
            <input
              type="text"
              placeholder="Course Code"
              value={courseCodeEP}
              onChange={(e) => setCourseCodeEP(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Course Name"
              value={courseNameEP}
              onChange={(e) => setCourseNameEP(e.target.value)}
              className="input"
            />
            <input
              type="number"
              min={0}
              placeholder="Credits"
              value={creditsEP}
              onChange={(e) =>
                setCreditsEP(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="input"
            />
            <button onClick={handleAddCourse} className="button">
              <FiPlusCircle style={{ marginRight: "0.3rem" }} /> Add Course
            </button>
          </div>
        </section>
      )}

      {/* Courses Table */}
      {selectedProgram && (
        <section className="program-section">
          <h3 className="program-title">
            <FiBook className="icon-small" /> {selectedProgram} Courses
          </h3>

          {programs[selectedProgram].length === 0 ? (
            <p>No courses added yet.</p>
          ) : (
            <table className="course-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs[selectedProgram].map(({ Course_Code, Course_Name, Credits,id }) => (
                  <tr key={id}>
                    <td>{Course_Code}</td>

                    <td>
                      {editingCourseCode === Course_Code ? (
                        <input
                          type="text"
                          value={editCourseName}
                          onChange={(e) => setEditCourseName(e.target.value)}
                        />
                      ) : (
                        Course_Name
                      )}
                    </td>

                    <td>
                      {editingCourseCode === Course_Code ? (
                        <input
                          type="number"
                          min={0}
                          value={editCredits}
                          onChange={(e) =>
                            setEditCredits(
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                          style={{ width: "4rem" }}
                        />
                      ) : (
                        Credits
                      )}
                    </td>

                    <td>
                      {editingCourseCode === Course_Code ? (
                        <>
                          <button onClick={saveEdit} className="button small">
                            <FiCheck />
                          </button>
                          <button onClick={cancelEditing} className="button small danger">
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              startEditing({ Course_Code, Course_Name, Credits ,id})
                            }
                            className="button small"
                            title="Edit course"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteCourse( courseCode, id ||0)}
                            className="button small danger"
                            title="Delete course"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* If no program selected */}
      {!selectedProgram && (
        <section className="program-list">
          <p>Please select a program to see courses.</p>
        </section>
      )}
    </main>
  );
}
