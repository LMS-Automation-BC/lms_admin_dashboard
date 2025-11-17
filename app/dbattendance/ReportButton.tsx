import React, { useState } from "react";
import styles from "./ReportButton.module.css";

const ReportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "reports",
        start: startDate,
        end: endDate,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/attendance?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      console.log("API Response:", data);
      alert("Report fetched! Check attendance page for data.");
    } catch (error) {
      console.error(error);
      alert("Failed to fetch report.");
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <div>
      <button onClick={openModal} className={styles.btnPrimary}>
        Run Report from LMS
      </button>

      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <p>
              <b>Note:</b>Run the report for max of 3 days. It takes time to run the
              report. Page will refresh once report is done. Report will be emailed to admins.
            </p>
            <h2 className={styles.modalHeader}>Select Date Range</h2>

            <div className={styles.field}>
              <label className={styles.label}>
                Start Date:{" "}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                End Date:{" "}
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Fetching..." : "Run Report"}
              </button>
              <button onClick={closeModal} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportButton;
