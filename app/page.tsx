
import React from 'react';
import CsvUpload from './components/CSVUploader';

const AttendancePage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Attendance Processor</h1>
      <CsvUpload />
    </div>
  );
};

export default AttendancePage;
