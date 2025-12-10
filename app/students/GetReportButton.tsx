import React from "react";
import { compareTranscriptArrays } from "./transcripts/TranscriptDiffModal";
import { CsvRow } from "../components/GradeParser";

export interface DiffResult {
  field: string;
  oldValue: string | number;
  newValue: string | number;
}


interface GetReportButtonProps {
  enrollmentNo: string;
  viewOnly: boolean;
  reportLoading: boolean;
  setReportLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCoursesTranscript: React.Dispatch<React.SetStateAction<CsvRow[]>>;
  setDiffData: React.Dispatch<React.SetStateAction<DiffResult[]>>;
  setShowDiffModal: React.Dispatch<React.SetStateAction<boolean>>;
  existingTranscript: CsvRow[];
}

const GetReportButton: React.FC<GetReportButtonProps> = ({
  enrollmentNo,
  viewOnly,
  reportLoading,
  setReportLoading,
  setCoursesTranscript,
  setDiffData,
  setShowDiffModal,
  existingTranscript,
}) => {
  const handleGetReport = async () => {
    try {
      setReportLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?type=getfromlms&studentId=${enrollmentNo}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch LMS report");
      }

      const data: CsvRow[] = await res.json();

      setCoursesTranscript(data);

      const diffs = compareTranscriptArrays(existingTranscript, data);
      setDiffData(diffs);

      setShowDiffModal(true);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <button
      hidden={viewOnly}
      onClick={handleGetReport}
      className="export-button"
      disabled={reportLoading}
    >
      {reportLoading ? "Loading..." : "Get Report From LMS"}
    </button>
  );
};

export default GetReportButton;
