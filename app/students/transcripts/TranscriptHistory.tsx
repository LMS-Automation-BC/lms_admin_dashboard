import React, { useEffect, useState } from "react";
import styles from "./TranscriptHistory.module.css"; // import module

interface Transcript {
  Transcript_id: number;
  Student_ID: number;
  Transcript_Data?: string;
  Transcript_Status: "Created" | "Delivered";
  CreatedDate?: string;
  DeliveredDate?: string;
}

interface TranscriptHistoryProps {
  studentId: number;
}

const TranscriptHistory: React.FC<TranscriptHistoryProps> = ({ studentId }) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
  }, [studentId]);

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

  if (loading) return <p>Loading transcript history...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!transcripts.length) return <p>No transcripts found for student ID {studentId}</p>;

  return (
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
          </tr>
        </thead>
        <tbody>
          {transcripts.map((t) => (
            <tr key={t.Transcript_id}>
              <td>{t.Transcript_id}</td>
              <td>{t.CreatedDate ? new Date(t.CreatedDate).toLocaleString() : "N/A"}</td>
              <td>{t.DeliveredDate ? new Date(t.DeliveredDate).toLocaleString() : "N/A"}</td>
              <td className={t.Transcript_Status === "Delivered" ? styles.statusDelivered : ""}>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TranscriptHistory;
