import React from "react";
import styles from "./TranscriptDiffModal.module.css";

type DiffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  differences: any[];
};

const TranscriptDiffModal: React.FC<DiffModalProps> = ({ isOpen, onClose, differences }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Transcript Differences</h2>

        <button className={styles.closeBtn} onClick={onClose}>✖</button>

        {differences.length === 0 ? (
          <p>No differences found.</p>
        ) : (
          differences.map((diff) => (
            <div key={diff.key} className={styles.diffBlock}>
              <h3>Record: {diff.key}</h3>
              <table className={styles.diffTable}>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.differences && Object.entries(diff.differences).map(([field, values]: any) => (
                    <tr key={field}>
                      <td>{field}</td>
                      <td className={styles.oldValue}>{String(values.old ?? "—")}</td>
                      <td className={styles.newValue}>{String(values.new ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptDiffModal;
// utils/compareTranscripts.ts
export function compareTranscriptArrays(arr1: any[], arr2: any[]) {
  const differences: any[] = [];

  const mapB = new Map(
    arr2.map(item => [`${item.Course_Code}`, item])
  );

  arr1.forEach(itemA => {
    const key = `${itemA.Course_Code}`;
    const itemB = mapB.get(key);

    if (!itemB) {
      differences.push({
        key,
        message: "Missing in second dataset",
        old: itemA,
        new: null
      });
      return;
    }

    const fieldDiffs: any = {};

    for (const field of Object.keys(itemA)) {
      // ❌ Skip comparing this field
      if (field === "isInProgram") continue;

      const a = itemA[field];
      const b = itemB[field];

      // Treat null and undefined as equal
      const bothNil = (a == null && b == null);

      if (!bothNil && a !== b) {
        fieldDiffs[field] = {
          old: a,
          new: b,
        };
      }
    }

    if (Object.keys(fieldDiffs).length > 0) {
      differences.push({
        key,
        message: "Differences found",
        differences: fieldDiffs,
      });
    }
  });

  return differences;
}


