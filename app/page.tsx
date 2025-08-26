
import React from 'react';
import CsvUpload from './components/CSVUploader';
import CsvCombiner from './components/AttendanceProcessor';

const AttendancePage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Attendance Processor</h1>
      <CsvCombiner />
    </div>
  );
};

export default AttendancePage;
