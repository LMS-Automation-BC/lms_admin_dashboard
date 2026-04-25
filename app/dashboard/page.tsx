"use client";
import styles from './page.module.css';
import InProgressStudentsTile from '../components/InProgressStudentsTile';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of key metrics and reports.
        </p>
      </div>

      <div className={styles.tilesGrid}>
        <InProgressStudentsTile />
        {/* Add more tiles here as needed */}
      </div>
    </div>
  );
} 
