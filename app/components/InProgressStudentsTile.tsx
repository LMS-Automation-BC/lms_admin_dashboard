"use client";
import { useState, useCallback } from 'react';
import styles from './InProgressStudentsTile.module.css'; // We'll create this CSS file

interface Student {
  id: string | number;
  name: string;
  email: string;
  status: 'waiting' | 'fetching' | 'completed' | 'error';
  report?: any;
}

export default function InProgressStudentsTile() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [fetchStatus, setFetchStatus] = useState<string>('Ready to start processing student reports.');
  const [summaryInfo, setSummaryInfo] = useState<{ page: number; limit: number } | null>(null);

  const normalizeStudent = (student: any): Student => ({
    id: student.id || student.Student_ID || student.userId || student.user_id || Math.random(),
    name:
      student.Full_Name || student.fullName ||
      `${student.first_name || student.firstName || ''} ${student.last_name || student.lastName || ''}`.trim() ||
      student.name ||
      'Student',
    email: student.email || student.Email_Address || 'N/A',
    status: 'waiting',
    ...student,
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setFetchStatus('Fetching reports one by one. Please wait while we process each student.');
    setStudents([]);
    setCurrentIndex(-1);
    setSummaryInfo(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/student?type=filterstudents&page=1&limit=20&status=In+Progress`);
      if (!res.ok) {
        setFetchStatus('Failed to fetch report. Please try again.');
        return;
      }

      const data = await res.json();
      const rawStudents = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.data)
        ? data.data
        : [];

      const normalized = rawStudents.map((student: any) => ({
        ...normalizeStudent(student),
        status: 'waiting',
      }));

      setStudents(normalized);
      setSummaryInfo({ page: data.page || 1, limit: data.limit || 20 });

      if (normalized.length === 0) {
        setFetchStatus('No in-progress students found for this filter.');
        setLoading(false);
        return;
      }

      setFetchStatus('Starting to fetch individual reports...');
      setCurrentIndex(0);

      // Sequentially fetch reports for each student
      for (let i = 0; i < normalized.length; i++) {
        setCurrentIndex(i);
        const student = normalized[i];

        // Update student status to fetching
        setStudents(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'fetching' } : s
        ));

        try {
          const reportRes = await fetch(
            `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?type=getfromlms&studentId=${student.id}`
          );

          if (!reportRes.ok) {
            throw new Error("Failed to fetch LMS report");
          }

          const reportData = await reportRes.json();

          // Update student status to completed
          setStudents(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'completed', report: reportData } : s
          ));

          setFetchStatus(`Completed ${i + 1}/${normalized.length} students. Processing ${student.name}...`);
        } catch (error) {
          console.error(`Error fetching report for ${student.name}:`, error);

          // Update student status to error
          setStudents(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'error' } : s
          ));

          setFetchStatus(`Error fetching report for ${student.name}. Continuing with next student...`);
        }

        // Small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCurrentIndex(-1);
      setFetchStatus(`All reports fetched. ${normalized.filter((s: any) => s.status === 'completed').length}/${normalized.length} successful.`);
    } catch (error) {
      console.error('Error fetching report:', error);
      setFetchStatus('Error fetching report. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetInprogressReport = async () => {
    await fetchReport();
  };

  const currentStudent = currentIndex >= 0 ? students[currentIndex] : null;
  const completedCount = students.filter((student) => student.status === 'completed' || student.status === 'error').length;
  const totalCount = students.length;

  return (
    <div className={styles.tile}>
      <div className={styles.tileHeader}>
        <h2 className={styles.tileTitle}>In Progress Students Report</h2>
        <button onClick={handleGetInprogressReport} disabled={loading} className={styles.startButton}>
          {loading ? 'Fetching...' : 'Start Fetch'}
        </button>
      </div>

      <div className={styles.tileContent}>
        <div className={styles.twoColumnLayout}>
          <section className={styles.leftColumn}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Students (In Progress)</h3>
              <span className={styles.countBadge}>{completedCount}/{totalCount}</span>
            </div>

            <div className={styles.studentCards}>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <div
                    key={student.id}
                    className={`${styles.studentCard} ${currentIndex === index ? styles.activeStudentCard : ''}`}
                  >
                    <div className={styles.studentAvatar}>{student.name.split(' ').map((word: string) => word[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentName}>{student.name}</div>
                      <div className={styles.studentMeta}>
                        {student.status === 'fetching' ? 'Fetching report...' :
                         student.status === 'waiting' ? 'Waiting in queue' :
                         student.status === 'completed' ? 'Report fetched' :
                         student.status === 'error' ? 'Error fetching report' : 'Pending'}
                      </div>
                    </div>
                    <div className={styles.studentIndex}>{index + 1}</div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  Ready to fetch in-progress students. Click the "Start Fetch" button to begin.
                </div>
              )}
            </div>
          </section>

          <section className={styles.rightColumn}>
            <div className={styles.statusHeader}>
              <p className={styles.statusLabel}>Currently Fetching</p>
              <h3 className={styles.currentStudentName}>{currentStudent?.name || 'No active report'}</h3>
              <p className={styles.statusHint}>Please do not close or navigate away from this page.</p>
            </div>

            <div className={styles.progressTrack}>
              <div className={`${styles.progressStep} ${currentStudent ? styles.activeStep : ''}`}>
                <span className={styles.stepCircle}>1</span>
                <span>Fetching Report</span>
              </div>
              <div className={styles.stepLine} />
              <div className={styles.progressStep}>
                <span className={styles.stepCircle}>2</span>
                <span>Completed</span>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusCardBody}>
                <div className={styles.statusIcon}>{loading ? '⟳' : '✓'}</div>
                <div>
                  <p className={styles.statusCardTitle}>{loading ? 'Fetching report…' : 'No active fetching task'}</p>
                  <p className={styles.statusCardText}>
                    {loading
                      ? 'This may take a few seconds.'
                      : students.length > 0
                      ? 'Fetching has completed for all current students.'
                      : 'Click "Start Fetch" to begin processing student reports.'}
                  </p>
                </div>
              </div>
              <div className={styles.statusCardFooter}>
                {students.length > 0 && (
                  <span>
                    {students.filter(s => s.status === 'completed').length} completed, {' '}
                    {students.filter(s => s.status === 'error').length} errors / {totalCount} total
                  </span>
                )}
              </div>
            </div>

            <div className={styles.bottomNote}>
              {fetchStatus}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}