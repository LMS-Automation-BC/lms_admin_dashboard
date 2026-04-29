import React from "react";
import { compareTranscriptArrays } from "./transcripts/TranscriptDiffModal";
import { CsvRow } from "../components/GradeParser";
import toast from 'react-hot-toast';

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
  assignments?: boolean;
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
  assignments = false,
}) => {
  const handleGetReport = async () => {
    try {
      setReportLoading(true);

      const assignmentsParam = assignments ? "&assignments=true" : "";
      const url = assignments? `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?studentId=${enrollmentNo}${assignmentsParam}`
      : `${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/grade?type=getfromlms&studentId=${enrollmentNo}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch LMS report");
      }

      const data: CsvRow[] = await res.json();

      setCoursesTranscript(data);

      const diffs = compareTranscriptArrays(existingTranscript, data);
      setDiffData(diffs);

      if (diffs.length === 0) {
        toast.success(`${assignments ? "Assignments" : "Report"} fetched successfully, no changes found.`);
      } else {
        toast.success(`${assignments ? "Assignments" : "Report"} fetched successfully, differences found.`);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      toast.error(`Failed to fetch ${assignments ? "assignments" : "LMS report"}`);
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
      {reportLoading ? "Loading..." : `Get ${assignments ? "Assignments" : "Report"} From LMS`}
    </button>
  );
};

export default GetReportButton;
