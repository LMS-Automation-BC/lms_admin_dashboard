"use client";

import React, { useEffect, useState } from "react";
import "./programs.css";
import {
  FiBook,
  FiPlusCircle,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
} from "react-icons/fi";

interface Course {
  Course_Code: string;
  Course_Name: string;
  Credits: number;
  id?: number;
}

interface ProgramsMap {
  [programName: string]: Course[];
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramsMap>({});
  const [newProgramName, setNewProgramName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState<number | "">("");

  const [courseCodeEP, setCourseCodeEP] = useState("");
  const [courseNameEP, setCourseNameEP] = useState("");
  const [creditsEP, setCreditsEP] = useState<number | "">("");

  const [editingCourseCode, setEditingCourseCode] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [editCredits, setEditCredits] = useState<number | "">("");

  const [editingProgramName, setEditingProgramName] = useState(false);
  const [editProgramName, setEditProgramName] = useState("");

  const [loading, setLoading] = useState(false);

  // LOAD PROGRAMS
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`)
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // ADD PROGRAM
  const handleAddProgram = async () => {
    const trimmed = newProgramName.trim();
    if (!trimmed) return alert("Program name can't be empty");
    if (programs[trimmed]) return alert("Program already exists");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: trimmed,
          courseCode,
          courseName,
          credits,
        }),
      }
    );

    if (!res.ok) return alert("Failed to add program");

    const data = await res.json();

    setPrograms({
      ...programs,
      [trimmed]: [
        {
          Course_Code: courseCode,
          Course_Name: courseName,
          Credits: Number(credits),
          id: data.insertedId,
        },
      ],
    });

    setNewProgramName("");
    setCourseCode("");
    setCourseName("");
    setCredits("");
  };

  // ADD COURSE TO PROGRAM
  const handleAddCourse = async () => {
    if (!selectedProgram) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: selectedProgram,
          courseCode: courseCodeEP,
          courseName: courseNameEP,
          credits: creditsEP,
        }),
      }
    );

    if (!res.ok) return alert("Failed to add course");

    setPrograms((prev) => ({
      ...prev,
      [selectedProgram]: [
        ...prev[selectedProgram],
        {
          Course_Code: courseCodeEP,
          Course_Name: courseNameEP,
          Credits: Number(creditsEP),
        },
      ],
    }));

    setCourseCodeEP("");
    setCourseNameEP("");
    setCreditsEP("");
  };

  // DELETE PROGRAM
  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    if (!confirm(`Delete program "${selectedProgram}"?`)) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program?name=${selectedProgram}`,
      { method: "DELETE" }
    );

    if (!res.ok) return alert("Failed to delete program");

    const updated = { ...programs };
    delete updated[selectedProgram];
    setPrograms(updated);
    setSelectedProgram(null);
  };

  // START EDIT COURSE
  const startEditing = (course: Course) => {
    setEditingCourseCode(course.Course_Code);
    setEditCourseName(course.Course_Name);
    setEditCredits(course.Credits);
    setEditCourseId(course.id ?? null);
  };

  const cancelEditing = () => {
    setEditingCourseCode(null);
    setEditCourseName("");
    setEditCredits("");
    setEditCourseId(null);
  };

  // SAVE EDITED COURSE  (PUT /program/:programName)
  const saveEdit = async () => {
    if (!selectedProgram || !editingCourseCode) return;

    const payload = [
      {
        courseCode: editingCourseCode,
        courseName: editCourseName.trim(),
        credits: Number(editCredits),
      },
    ];

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program/${encodeURIComponent(
        selectedProgram
      )}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) return alert("Failed to update course");

    setPrograms((prev) => ({
      ...prev,
      [selectedProgram]: prev[selectedProgram].map((c) =>
        c.Course_Code === editingCourseCode
          ? {
              ...c,
              Course_Name: editCourseName.trim(),
              Credits: Number(editCredits),
            }
          : c
      ),
    }));

    cancelEditing();
  };
  // DELETE COURSE
  const deleteCourse = async (courseCodeToDelete: string, id: number) => {
    if (!selectedProgram) return;

    if (!confirm(`Delete course ${courseCodeToDelete}?`)) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program?courseid=${id}`,
      { method: "DELETE" }
    );

    if (!res.ok) return alert("Failed to delete course");

    setPrograms((prev) => ({
      ...prev,
      [selectedProgram]: prev[selectedProgram].filter(
        (c) => c.Course_Code !== courseCodeToDelete
      ),
    }));
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;

  return (
    <main className="container">
      <h1 className="programstitle">
        <FiBook className="icon" /> Programs and Courses
      </h1>

      {/* ADD NEW PROGRAM */}
      <section className="add-section">
        <h2>Add New Program</h2>

        <input
          type="text"
          placeholder="Program Name"
          value={newProgramName}
          onChange={(e) => setNewProgramName(e.target.value)}
          className="input"
        />

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

      {/* SELECT PROGRAM */}
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
        >
          <option value="">-- Select Program --</option>
          {Object.keys(programs).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* EDIT PROGRAM NAME */}
        {selectedProgram && !editingProgramName && (
          <>
            <button
              onClick={() => {
                setEditingProgramName(true);
                setEditProgramName(selectedProgram);
              }}
              className="button"
              style={{ marginLeft: "1rem" }}
            >
              <FiEdit2 />
            </button>

            <button
              onClick={handleDeleteProgram}
              className="button danger"
              style={{ marginLeft: "1rem" }}
            >
              <FiTrash2 />
              Delete Program
            </button>
          </>
        )}

        {/* PROGRAM NAME SAVE */}
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
              className="button small"
              style={{ marginLeft: "0.5rem" }}
              onClick={async () => {
                const trimmed = editProgramName.trim();
                if (!trimmed) return alert("Program name can't be empty");
                if (trimmed === selectedProgram) {
                  setEditingProgramName(false);
                  return;
                }
                if (programs[trimmed]) return alert("Program already exists");

                // CALL BACKEND RENAME
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/program/${encodeURIComponent(
                    selectedProgram
                  )}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newName: trimmed }),
                  }
                );

                if (!res.ok) return alert("Failed to rename program");

                // UPDATE FRONTEND
                const updated: ProgramsMap = {};
                Object.entries(programs).forEach(([key, courses]) => {
                  updated[key === selectedProgram ? trimmed : key] = courses;
                });

                setPrograms(updated);
                setSelectedProgram(trimmed);
                setEditingProgramName(false);
              }}
            >
              <FiCheck />
            </button>

            <button
              className="button small danger"
              style={{ marginLeft: "0.5rem" }}
              onClick={() => setEditingProgramName(false)}
            >
              <FiX />
            </button>
          </>
        )}
      </section>

      {/* ADD COURSE */}
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
                setCreditsEP(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="input"
            />

            <button onClick={handleAddCourse} className="button">
              <FiPlusCircle /> Add Course
            </button>
          </div>
        </section>
      )}

      {/* COURSE TABLE */}
      {selectedProgram && (
        <section className="program-section">
          <h3 className="program-title">
            <FiBook className="icon-small" /> {selectedProgram} Courses
          </h3>

          <table className="course-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {programs[selectedProgram].map(
                ({ Course_Code, Course_Name, Credits, id }) => (
                  <tr key={id}>
                    <td> {editingCourseCode === Course_Code ? (
                        <input
                          value={editingCourseCode}
                          onChange={(e) => setEditingCourseCode(e.target.value)}
                        />
                      ) : (
                        Course_Code
                      )}</td>

                    {/* EDIT NAME */}
                    <td>
                      {editingCourseCode === Course_Code ? (
                        <input
                          value={editCourseName}
                          onChange={(e) => setEditCourseName(e.target.value)}
                          className="course-input"
                        />
                      ) : (
                        Course_Name
                      )}
                    </td>

                    {/* EDIT CREDITS */}
                    <td>
                      {editingCourseCode === Course_Code ? (
                        <input
                          type="number"
                          min={0}
                          value={editCredits}
                          onChange={(e) =>
                            setEditCredits(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
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
                          <button className="button small" onClick={saveEdit}>
                            <FiCheck />
                          </button>
                          <button
                            className="button small danger"
                            onClick={cancelEditing}
                          >
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="button small"
                            onClick={() =>
                              startEditing({
                                Course_Code,
                                Course_Name,
                                Credits,
                                id,
                              })
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            className="button small danger"
                            onClick={() =>
                              deleteCourse(Course_Code, id ?? 0)
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </section>
      )}

      {!selectedProgram && (
        <section className="program-list">
          <p>Please select a program to see courses.</p>
        </section>
      )}
    </main>
  );
}
