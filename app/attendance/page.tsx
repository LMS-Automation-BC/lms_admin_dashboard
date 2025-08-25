import CsvUpload from "../components/CSVUploader";

const AttendancePage: React.FC = () => {
  return (
    <div>
      <h1>Attendance Processor</h1>
      <CsvUpload />
    </div>
  );
};

export default AttendancePage;