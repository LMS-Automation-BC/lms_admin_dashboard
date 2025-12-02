import React, { useEffect, useState } from "react";
import styles from "./TranscriptHistory.module.css";
import Modal from "./Modal";
import GradeTranscript from "./GradeTranscript";

interface Transcript {
  Transcript_id: number;
  Student_ID: string;
  Transcript_Data?: string;
  Transcript_Status: "Created" | "Delivered";
  CreatedDate?: string;
  DeliveredDate?: string;
}

interface TranscriptHistoryProps {
  student_name:string;
  studentId: string;
  reload: number;
  program:string
  selectedProgram:Course[]
}

const TranscriptHistory: React.FC<TranscriptHistoryProps> = ({ studentId, student_name,reload,program,selectedProgram }) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // modal state
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);

  /** Fetch transcript history */
  const fetchTranscripts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/transcript?action=getByStudent&studentId=${studentId}`
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Transcript[] = await res.json();
      setTranscripts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchTranscripts();
  }, [studentId, reload]);

  /** Mark as delivered */
  const handleMarkDelivered = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/transcript?action=updateStatus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Transcript_id: id, status: "Delivered" }),
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      await fetchTranscripts();
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  /** Open modal for a specific transcript */
  const handleOpenTranscript = (t: Transcript) => {
    setSelectedTranscript(t);
    setOpen(true);
  };

  if (loading) return <p>Loading transcript history...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!transcripts.length) return <p>No transcripts found for student ID {studentId}</p>;

  return (
    <>
      {/* -------------------- MODAL -------------------- */}
      <Modal open={open} onClose={() => setOpen(false)}>
        {selectedTranscript && selectedTranscript.Transcript_Data && (
          <GradeTranscript
            viewOnly = {true}
            studentName={student_name}
            program={program}
            enrollmentNo={studentId}
            programStartDate={new Date().toString()}
            printDate={new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            courses={JSON.parse(selectedTranscript.Transcript_Data)}
            selectedProgram={selectedProgram}
            sisId=""
          />
        )}
      </Modal>

      {/* -------------------- TABLE -------------------- */}
      <div className={styles.container}>
        <h2 className={styles.title}>Transcript History for Student ID {studentId}</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Created Date</th>
              <th>Delivered Date</th>
              <th>Status</th>
              <th>Action</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {transcripts.map((t) => (
              <tr key={t.Transcript_id}>
                <td>{t.Transcript_id}</td>
                <td>{t.CreatedDate ? new Date(t.CreatedDate).toLocaleString() : "N/A"}</td>
                <td>{t.DeliveredDate ? new Date(t.DeliveredDate).toLocaleString() : "N/A"}</td>

                <td
                  className={
                    t.Transcript_Status === "Delivered"
                      ? styles.statusDelivered
                      : ""
                  }
                >
                  {t.Transcript_Status}
                </td>

                <td>
                  {t.Transcript_Status === "Created" ? (
                    <button
                      className={styles.button}
                      onClick={() => handleMarkDelivered(t.Transcript_id)}
                      disabled={updatingId === t.Transcript_id}
                    >
                      {updatingId === t.Transcript_id ? "Updating..." : "Mark as Delivered"}
                    </button>
                  ) : (
                    <span>Delivered</span>
                  )}
                </td>

                <td>
                  <button
                    className={styles.buttonSecondary}
                    onClick={() => handleOpenTranscript(t)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TranscriptHistory;
