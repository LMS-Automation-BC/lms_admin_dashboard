import DashboardPage from './dashboard/page';

const AttendancePage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Attendance Processor</h1>
      </div>
      <DashboardPage />
    </div>
  );
};

export default AttendancePage;
