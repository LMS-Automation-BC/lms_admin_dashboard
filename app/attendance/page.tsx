import CsvCombiner from "../components/AttendanceProcessor";
import CsvUpload from "../components/CSVUploader";
// import { checkPermission } from '@/lib/permissions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

const AttendancePage: React.FC = async () => {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) return <div>Not logged in</div>;

  // const canRead = await checkPermission(email, 'attendance', 'read');

  // if (!canRead) {
  //   return <div>Access Denied</div>;
  // }

  return (
    <div>
      <h1>Attendance Processor</h1>
      <CsvCombiner />
    </div>
  );
};

export default AttendancePage;