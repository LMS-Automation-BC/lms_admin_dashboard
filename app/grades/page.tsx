// app/grades/page.tsx
'use client'; // Required because we use state and events (client component)

import React from 'react';
import GradeParser from '../components/GradeParser';

const GradesPage: React.FC = () => {
  return (
    <div>
      <h1>User Grades Transcriptor</h1>
      <GradeParser />
    </div>
  );
};

export default GradesPage;
