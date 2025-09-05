
import React from 'react';
import CsvUpload from './components/CSVUploader';
import CsvCombiner from './components/AttendanceProcessor';
import DashboardPage from './dashboard/page';

const AttendancePage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Attendance Processor</h1>
      <DashboardPage />
    </div>
  );
};

export default AttendancePage;
