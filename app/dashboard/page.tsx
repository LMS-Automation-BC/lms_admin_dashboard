"use client";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';
import InProgressStudentsTile from '../components/InProgressStudentsTile';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Any dashboard initialization if needed
  }, [status]);

  if (status === 'loading') {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

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
