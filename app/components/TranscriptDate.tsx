import React from 'react';

// Utility function to format the date with hyphen (you can modify as needed)
  const formatDateWithHyphen = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  // Define the props interface
interface TranscriptDateProps {
  hideActions: boolean;
  label:string;
  programStart: string;
  setProgramStart: (date: string) => void;
}
const TranscriptDate: React.FC<TranscriptDateProps> = ({
  hideActions,
  programStart,
  setProgramStart,
  label
}) => {
  return hideActions ? (
    <div className="right">
      <span style={{ fontWeight: 550 }}>Program Start Date</span>:{" "}
      {formatDateWithHyphen(programStart)}
    </div>
  ) : (
    <label htmlFor="programStartDate" className="right">
      {label}:{" "}
      <input
        type="date"
        id="programStartDate"
        value={programStart}
        onChange={(e) => setProgramStart(e.target.value)}
      />
    </label>
  );
};

export default TranscriptDate;
