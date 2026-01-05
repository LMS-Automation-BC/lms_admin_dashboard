import { getGrade } from "@/app/grades/helpers/grade";

export const calculateGradePoint = (program: any[], users: any[]) => {
  const programCourseNames = new Set(
    program.map(c => c.Course_Name.toLowerCase().trim())
  );

  return sortUserGrades(program, users).map(user => {
    const gradePoint = getGrade(user.Grade)?.gpa || 0;
    const userCourseName = (user.Default_Course_Name || "")
      .toLowerCase()
      .trim();

    const isInProgram = userCourseName
      ? [...programCourseNames].some(
          p => p.includes(userCourseName) || userCourseName.includes(p)
        )
      : false;

    return {
      Course_Code: user.Course_Code,
      Course_Name: user.Course_Name,
      Default_Course_Name: user.Default_Course_Name || user.Course_Name,
      Credits: Number(user.Credits) || 0,
      Last_Attempt: user.Last_Attempt ?? user.Semester,
      Grade: user.Grade,
      Grade_Point: gradePoint,
      isInProgram,
    };
  });
};
 const sortUserGrades = (programCourses: any[], userGrades: any[])=> { 
    // Step 1: Build lookup maps 
    const courseNameToIndex: Record<string, number> = {};
     const courseNameToCode: Record<string, string> = {}; 
     programCourses.forEach((course: any, index: number) => { 
        const name = course.Course_Name.toLowerCase().trim(); 
        courseNameToIndex[name] = index; courseNameToCode[name] = course.Course_Code; 
    }); // Step 2: Map user grades to ensure Course_Code exists
     const mappedGrades = userGrades.map((grade: any) => { const nameKey = grade.Default_Course_Name?.toLowerCase()?.trim(); if (nameKey && courseNameToCode[nameKey]) { return { ...grade, Course_Code: courseNameToCode[nameKey] }; } return grade; // leave as-is if no match 
     }); 
    // Step 3: Sort by program course order 
    const sorted = [...mappedGrades].sort((a: any, b: any) => { const aIndex = courseNameToIndex[a.Default_Course_Name?.toLowerCase()?.trim()] ?? Infinity; const bIndex = courseNameToIndex[b.Default_Course_Name?.toLowerCase()?.trim()] ?? Infinity; return aIndex - bIndex; }); const completedCourses = new Set( userGrades.map((grade) => grade.Default_Course_Name?.toLowerCase()?.trim()) ); return sorted; 
}