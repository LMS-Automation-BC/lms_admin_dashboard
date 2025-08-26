import CsvCombiner from "../components/AttendanceProcessor";
import CsvUpload from "../components/CSVUploader";

const AttendancePage: React.FC = () => {
  return (
    <div>
      <h1>Attendance Processor</h1>
      <CsvCombiner />
    </div>
  );
};

export default AttendancePage;