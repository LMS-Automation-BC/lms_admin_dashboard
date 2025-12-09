import { useState, useRef, useEffect } from "react";
import styles from "./FastSelect.module.css";

export interface FastSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  style?: React.CSSProperties; // add this
}

const FastSelect: React.FC<FastSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select…",
  style
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref = useRef(null);

  // 🔹 Sync internal query with parent value
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.fastselect} ref={ref} style={style}>
      <input
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          onChange(val); // <-- notify parent immediately
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && (
        <ul className={styles.fastselectlist}>
          {filtered.length === 0 ? (
            <li className={styles.noresults}>No results</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  setQuery(opt);
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default FastSelect;
