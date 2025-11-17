import React from "react";
import styles from './UnfinishedCoursesList.module.css';
interface ProgramCourse {
  Course_Name: string;
  Course_Code: string;
  Credits: number;
}

interface Grade {
  Default_Course_Name: string;
  Course_Code?: string;
  Grade?: string;
}

interface Props {
  programCourses: ProgramCourse[];
  studentGrades: Grade[];
}

const UnfinishedCoursesList: React.FC<Props> = ({
  programCourses,
  studentGrades,
}) => {
  const unfinishedCourses = getUnfinishedCourses(programCourses, studentGrades);

  if (!unfinishedCourses.length) {
    return <p>All courses are completed! 🎉</p>;
  }

  return (
     <div className={styles.unfinishedcontainer}>
      <h3>Unfinished Courses</h3>
      <ul className={styles.unfinishedlist}>
        {unfinishedCourses.map(course => (
          <li key={course.Course_Code} className={styles.unfinisheditem}>
            <span className={styles.coursename}>{course.Course_Name}</span>
            <span className={styles.coursecode}>{course.Course_Code}</span>
            <span className={styles.coursecredits}>{course.Credits} credits</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnfinishedCoursesList;
export function getUnfinishedCourses(
  programCourses: any[],
  userGrades: any[]
): any[] {
  const completedCourses = new Set(
    userGrades.map(grade => grade["Default Class Name"]?.toLowerCase()?.trim())
  );

  return programCourses.filter(course => {
    const courseName = course.Course_Name.toLowerCase().trim();
    return !completedCourses.has(courseName);
  });
}
