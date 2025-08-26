import React, { useState, useMemo } from "react";
import "./csvUpload.css";
import Select from "react-select";
type CombinedAttendance = {
  course_id: string;
  id: string;
  name: string;
  course_name: string;
  email: string;
  date: string; // assume ISO string format like '2023-08-26'
};

interface FiltersProps {
  data: CombinedAttendance[];
  onFilterChange: (filters: {
    startDate: string | null;
    endDate: string | null;
    selectedName: string | null;
    selectedCourse: string | null;
    showAbsentOnly:boolean;
  }) => void;
}

const AttendanceFilters: React.FC<FiltersProps> = ({
  data,
  onFilterChange,
}) => {
  // Extract all unique dates, sorted ascending
  const allDates = useMemo(() => {
    const uniqueDates = Array.from(new Set(data.map((d) => d.date)));
    uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return uniqueDates.map((date) => ({
      value: new Date(date).toLocaleDateString(),
      label: new Date(date).toLocaleDateString(), // formatted label
    }));
  }, [data]);

  // State for selected filters
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showAbsentOnly, setShowAbsentOnly] = useState(false);
  // Filter data by selected date range
  const filteredByDate = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter(({ date }) => {
      const d = new Date(date);
      return d >= start && d <= end;
    });
  }, [data, startDate, endDate]);

  // Unique names filtered by date
  const filteredNames = useMemo(() => {
    const names = Array.from(new Set(filteredByDate.map((d) => d.name)));
    names.sort();
    return names;
  }, [filteredByDate]);

  // Unique courses filtered by date
  const filteredCourses = useMemo(() => {
    const courses = Array.from(
      new Set(filteredByDate.map((d) => d.course_name))
    );
    courses.sort();
    return courses;
  }, [filteredByDate]);

  // Call parent's filter change on any change
  React.useEffect(() => {
    onFilterChange({
      startDate,
      endDate,
      selectedName,
      selectedCourse,
      showAbsentOnly
    });
  }, [startDate, endDate, selectedName, selectedCourse, onFilterChange,showAbsentOnly]);

  return (
    <div>
      {/* Row 1: Start & End Date */}
      <div
        className="date-range-filter"
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <div>
          <label>Start Date</label>
          <Select
            options={allDates}
            value={allDates.find((opt) => opt.value === startDate) || null}
            onChange={(selected) =>
              setStartDate(selected ? selected.value : null)
            }
            isClearable
            placeholder="Select start date"
          />
        </div>

        <div>
          <label>End Date</label>
          <Select
            options={allDates.filter(
              (opt) => !startDate || new Date(opt.value) >= new Date(startDate)
            )}
            value={allDates.find((opt) => opt.value === endDate) || null}
            onChange={(selected) =>
              setEndDate(selected ? selected.value : null)
            }
            isClearable
            placeholder="Select end date"
          />
        </div>
      </div>

      {/* Row 2: Name & Course */}
      <div
        className="date-range-filter"
        style={{ display: "flex", gap: "1rem" }}
      >
        <div>
          <label>Name</label>
          <select
            value={selectedName ?? ""}
            onChange={(e) => setSelectedName(e.target.value || null)}
            disabled={!startDate || !endDate}
          >
            <option value="">-- Select Name --</option>
            {filteredNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Course</label>
          <select
            value={selectedCourse ?? ""}
            onChange={(e) => setSelectedCourse(e.target.value || null)}
            disabled={!startDate || !endDate}
          >
            <option value="">-- Select Course --</option>
            {filteredCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label>
  <input
    type="checkbox"
    checked={showAbsentOnly}
    onChange={() => setShowAbsentOnly(!showAbsentOnly)}
  />
  Show Absent Only (0% Attendance)
</label>

      </div>
    </div>
  );
};

export default AttendanceFilters;
