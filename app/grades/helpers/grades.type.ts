export type Course = {
  courseCode: string;
  courseName: string;
  credits: number;
  letterGrade?: string;
  gradePoints?: number;
};
export type ProgramName = keyof typeof courses;
export type CoursesMap = {
  [programName: string]: Course[];
};