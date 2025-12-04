import React from "react";
import styles from './UnfinishedCoursesList.module.css';


interface Props {
  unfinishedCourses: any[];
}

const UnfinishedCoursesList: React.FC<Props> = ({
  unfinishedCourses
}) => {
  

  if (!unfinishedCourses.length) {
    return <p>All courses are completed! 🎉</p>;
  }

  return (
     <div className={styles.unfinishedcontainer}>
      <h3>Unfinished Courses</h3>
      <ul className={styles.unfinishedlist}>
        {unfinishedCourses.map((course, index) => (
          <li key={course.Course_Code + index} className={styles.unfinisheditem}>
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
  userGrades
    .filter(grade => grade["Default_Course_Name"]?.trim() && grade["Grade"] !== "")
    .map(grade => grade["Default_Course_Name"]!.toLowerCase().trim())
);

  return programCourses.filter(course => {
    const courseName = course.Course_Name.toLowerCase().trim();
    return !completedCourses.has(courseName);
  });
}
