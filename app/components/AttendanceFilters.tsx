import React, { useState, useMemo, useEffect } from "react";
import "./csvUpload.css";
import Select from "react-select";
import { debounce } from 'lodash';

type CombinedAttendance = {
  course_id: string;
  id: string;
  name: string;
  course_name: string;
  email: string;
  date: string;
};

interface FiltersProps {
  data: CombinedAttendance[];
  onFilterChange: (filters: {
    startDate: string | null;
    endDate: string | null;
    selectedName: string | null;
    selectedCourse: string | null;
    showAbsentOnly: boolean;
  }) => void;
}

const AttendanceFilters: React.FC<FiltersProps> = ({ data, onFilterChange }) => {
  // Form state (inputs)
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showAbsentOnly, setShowAbsentOnly] = useState(false);

  // Applied filters (trigger on Search)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: null as string | null,
    endDate: null as string | null,
    selectedName: null as string | null,
    selectedCourse: null as string | null,
    showAbsentOnly: false,
  });

  // Dates for dropdown
  const allDates = useMemo(() => {
    const uniqueDates = Array.from(new Set(data.map(d => d.date))).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    return uniqueDates.map(date => ({ value: date, label: new Date(date).toLocaleDateString() }));
  }, [data]);

  // Dynamic filter options based on form inputs
  const filteredNames = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = data.filter(({ date }) => {
      const d = new Date(date);
      return d >= start && d <= end;
    });

    return Array.from(new Set(filtered.map(d => d.name))).sort();
  }, [data, startDate, endDate]);

  const filteredCourses = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = data.filter(({ date }) => {
      const d = new Date(date);
      return d >= start && d <= end;
    }).filter(d => !selectedName || d.name === selectedName);

    return Array.from(new Set(filtered.map(d => d.course_name))).sort();
  }, [data, startDate, endDate, selectedName]);

  // Apply filters on Search click
  const applyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      selectedName,
      selectedCourse,
      showAbsentOnly,
    });
    onFilterChange({
      startDate,
      endDate,
      selectedName,
      selectedCourse,
      showAbsentOnly,
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedName(null);
    setSelectedCourse(null);
    setShowAbsentOnly(false);
    setAppliedFilters({
      startDate: null,
      endDate: null,
      selectedName: null,
      selectedCourse: null,
      showAbsentOnly: false,
    });
    onFilterChange({
      startDate: null,
      endDate: null,
      selectedName: null,
      selectedCourse: null,
      showAbsentOnly: false,
    });
  };

  return (
    <div>
      {/* Row 1: Dates */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Start Date</label>
          <Select
            options={allDates}
            value={allDates.find(opt => opt.value === startDate) || null}
            onChange={opt => setStartDate(opt ? opt.value : null)}
            isClearable
            placeholder="Select start date"
          />
        </div>

        <div>
          <label>End Date</label>
          <Select
            options={allDates.filter(opt => !startDate || new Date(opt.value) >= new Date(startDate))}
            value={allDates.find(opt => opt.value === endDate) || null}
            onChange={opt => setEndDate(opt ? opt.value : null)}
            isClearable
            placeholder="Select end date"
          />
        </div>
      </div>

      {/* Row 2: Name and Course */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <div>
          <label>Name</label>
          <select
            value={selectedName ?? ""}
            onChange={e => setSelectedName(e.target.value || null)}
            disabled={!startDate || !endDate}
          >
            <option value="">-- Select Name --</option>
            {filteredNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Course</label>
          <select
            value={selectedCourse ?? ""}
            onChange={e => setSelectedCourse(e.target.value || null)}
            disabled={!startDate || !endDate}
          >
            <option value="">-- Select Course --</option>
            {filteredCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <button className="submit-btn" onClick={applyFilters}>Search</button>
        <button className="submit-btn" onClick={handleReset}>Reset Filters</button>
      </div>

      {/* Row 3: Absent Checkbox */}
      <div style={{ marginTop: "10px" }}>
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
