const gradeScale = [
  { min: 90, max: 100, grade: 'A+', gpa: 4.0, description: 'Excellent' },
  { min: 85, max: 89, grade: 'A', gpa: 4.0, description: '' },
  { min: 80, max: 84, grade: 'A-', gpa: 3.7, description: '' },
  { min: 76, max: 79, grade: 'B+', gpa: 3.3, description: 'Good' },
  { min: 72, max: 75, grade: 'B', gpa: 3.0, description: '' },
  { min: 68, max: 71, grade: 'B-', gpa: 2.7, description: '' },
  { min: 64, max: 67, grade: 'C+', gpa: 2.3, description: 'Satisfactory' },
  { min: 60, max: 63, grade: 'C', gpa: 2.0, description: '' },
  { min: 55, max: 59, grade: 'C-', gpa: 1.7, description: '' },
  { min: 50, max: 54, grade: 'D', gpa: 1.0, description: 'Minimal Pass' },
  { min: 0, max: 49, grade: 'F', gpa: 0.0, description: 'Fail' }
];

// Function to look up grade based on score
export function getGrade(grade:string) {
  for (const range of gradeScale) {
    if (grade?.toLowerCase().trim() === range.grade.toLowerCase().trim()) {
      return range;
    }
  }
  return null; // Return null if score is out of bounds
}
export function extractMonthYear(text: string): string | null {
  // Regex to match full or abbreviated month + 4-digit year
  const regex = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{4})\b/i;
  const match = text.match(regex);
  if (!match) return "";

  const month = match[1].substring(0, 3);
  const year = match[2];
  return `${month} ${year}`;
}