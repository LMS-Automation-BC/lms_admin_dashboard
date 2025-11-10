'use client';
import { useState, useEffect } from "react";
import styles from "./StudentModal.module.css";

interface StudentModalProps {
  mode: "add" | "edit";
  student?: any;
  grades?: any;
  onClose: () => void;
  onSave: (studentData: any) => void;
}

const StudentModal = ({
  mode,
  student,
  onClose,
  onSave,
}: StudentModalProps) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({ ...student });
    } else if (mode === "add") {
      setFormData({}); // clear form for adding
    }
  }, [mode, student]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{mode === "add" ? "Add Student" : "Edit Student"}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
        <form onSubmit={handleSubmit}>
          {Object.entries(formData)
            .filter(([key]) => key !== "_id")
            .reduce<[[string, string | number | null | undefined]][]>(
              (rows, entry, index, array) => {
                if (index % 2 === 0) {
                  rows.push(
                    array.slice(index, index + 2) as [
                      [string, string | number | null | undefined]
                    ]
                  );
                }
                return rows;
              },
              []
            )
            .map((pair, rowIndex) => (
              <div className={styles.formRow} key={`row-${rowIndex}`}>
                {pair.map(([key, value]) => (
                  <div className={styles.formGroup} key={key}>
                    <label>{key.replace(/_/g, " ")}</label>
                    <input
                      type="text"
                      value={value?.toString() ?? ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}

          <button type="submit" className={styles.submitButton}>
            {mode === "add" ? "Add Student" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
