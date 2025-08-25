"use client"; // If using Next.js app router

import React, { useRef, useState } from "react";
import styles from "./UserGradesTable.module.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
type ClassInfo = {
  name: string;
  course_code: string;
};

type UserGradeRecord = {
  user_id: number;
  grade: string;
  credits: number; // 🆕 new field
  class: ClassInfo;
};

const sampleData: UserGradeRecord[] = [
  {
    user_id: 10496996,
    grade: "A+",
    credits: 3,
    class: {
      name: "TEST TEST TEST Course",
      course_code: "test",
    },
  },
];
const GradeParser: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [filteredData, setFilteredData] = useState<ApiUserGrades[]>([]);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [editableRows, setEditableRows] = useState<
    Record<number, Partial<UserGradeRecord>>
  >({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  
  const handleSearch = async () => {
    try {
      const data = await fetchUserGrades(userId);
      setFilteredData(data || []);

      const gradeMap: Record<number, string> = {};
      data?.forEach((item) => {
        gradeMap[item.user_id] = item.grade;
      });
      setGrades(gradeMap);
    } catch (error) {
      console.error("Error fetching user grades:", error);
      setFilteredData([]);
    }
  };


  const handleEditToggle = (userId: number) => {
    const user = filteredData.find((u) => u.user_id === userId);
    if (user) {
      setEditingRow(userId);
      setEditableRows({
        [userId]: {
          grade: user.grade,
          credits: user.credits,
          class: {
            name: user.class.name,
            course_code: user.class.course_code,
          },
        },
      });
    }
  };
  const handleFieldChange = (
    userId: number,
    field: string,
    value: string | number
  ) => {
    setEditableRows((prev: any) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
        class: {
          ...prev[userId]?.class,
        },
      },
    }));
  };
  const handleClassFieldChange = (
    userId: number,
    field: keyof ClassInfo,
    value: string
  ) => {
    setEditableRows((prev: any) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        class: {
          ...prev[userId]?.class,
          [field]: value,
        },
      },
    }));
  };
  const handleSave = (userId: number) => {
    const updated = filteredData.map((row) => {
      if (row.user_id === userId) {
        return {
          ...row,
          ...editableRows[userId],
          class: {
            ...row.class,
            ...editableRows[userId]?.class,
          },
        };
      }
      return row;
    });
    setFilteredData(updated);
    setEditingRow(null);
    setEditableRows({});
  };
  const generatePdf = () => {
    const doc = new jsPDF();

    doc.text('User Grades Table', 14, 15);

    const tableColumn = ['User ID', 'Grade', 'Class Name', 'Course Code', 'Credits'];
    const tableRows: any[] = [];

    filteredData.forEach(item => {
      tableRows.push([
        item.user_id.toString(),
        grades[item.user_id] || item.grade,
        item.class.name,
        item.class.course_code,
        item.credits?.toString() ?? '', // if you added credits to data
      ]);
    });

    autoTable(doc,{
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    // Create PDF blob and URL for preview
    const pdfBlob = doc.output('blob');
    const blobUrl  = URL.createObjectURL(pdfBlob);
     const pdfWindow = window.open('', '_blank', 'width=800,height=600');
    if (pdfWindow) {
      pdfWindow.document.title = 'PDF Preview';
      pdfWindow.document.body.style.margin = '0';

      const iframe = pdfWindow.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.src = blobUrl;

      pdfWindow.document.body.appendChild(iframe);

      pdfWindow.onunload = () => {
        URL.revokeObjectURL(blobUrl);
      };
    } else {
      alert('Popup blocked! Please allow popups for this website.');
    }
    // setPdfUrl(blobUrl );
  };
  const exportPdf = () => {
    const doc = new jsPDF();

    doc.text('User Grades Table', 14, 15);

    const tableColumn = ['User ID', 'Grade', 'Class Name', 'Course Code', 'Credits'];
    const tableRows: any[] = [];

    filteredData.forEach(item => {
      tableRows.push([
        item.user_id.toString(),
        grades[item.user_id] || item.grade,
        item.class.name,
        item.class.course_code,
        item.credits?.toString() ?? '',
      ]);
    });

   autoTable(doc,{
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('user-grades.pdf');
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>User Grade Table</h2>

      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className={styles.searchInput}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        Search
      </button>
        <button onClick={generatePdf} disabled={filteredData.length === 0}>
        Preview PDF
      </button>
      <button onClick={exportPdf} disabled={filteredData.length === 0} style={{ marginLeft: 10 }}>
        Export as PDF
      </button>

      {filteredData.length > 0 ? (
        <table className={styles.gradeTable}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Grade</th>
              <th>Class Name</th>
              <th>Course Code</th>
              <th>Credits</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.user_id}</td>

                <td>
                  {editingRow === item.user_id ? (
                    <input
                      className={styles.input}
                      value={editableRows[item.user_id]?.grade || ""}
                      onChange={(e) =>
                        handleFieldChange(item.user_id, "grade", e.target.value)
                      }
                    />
                  ) : (
                    item.grade
                  )}
                </td>

                <td>
                  {editingRow === item.user_id ? (
                    <input
                      className={styles.input}
                      value={editableRows[item.user_id]?.class?.name || ""}
                      onChange={(e) =>
                        handleClassFieldChange(
                          item.user_id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    item.class.name
                  )}
                </td>

                <td>
                  {editingRow === item.user_id ? (
                    <input
                      className={styles.input}
                      value={
                        editableRows[item.user_id]?.class?.course_code || ""
                      }
                      onChange={(e) =>
                        handleClassFieldChange(
                          item.user_id,
                          "course_code",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    item.class.course_code
                  )}
                </td>

                <td>
                  {editingRow === item.user_id ? (
                    <input
                      className={styles.input}
                      type="number"
                      value={editableRows[item.user_id]?.credits || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          item.user_id,
                          "credits",
                          Number(e.target.value)
                        )
                      }
                    />
                  ) : (
                    item.credits
                  )}
                </td>

                <td>
                  {editingRow === item.user_id ? (
                    <button
                      onClick={() => handleSave(item.user_id)}
                      className={styles.actionButton}
                    >
                      ✅ Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditToggle(item.user_id)}
                      className={styles.actionButton}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: 20 }}>No data found. Enter a valid user ID.</p>
      )}
    </div>
  );
};
const fetchUserGrades = async (id: string): Promise<ApiUserGrades[] | null> => {
  try {
    const response = await fetch(`/api/grades?lmsid=${id}`);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return data as ApiUserGrades[];
  } catch (err) {
    console.error(`Failed to fetch user info for ID ${id}`, err);
    return null;
  }
};
interface ApiUserGrades {
  user_id: number;
  grade: string;
  credits: number;
  class: {
    name: string;
    course_code: string;
  };
}

export default GradeParser;
