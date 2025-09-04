import { CsvRow } from "@/app/components/GradeParser";
import { CoursesMap } from "./grades.type";

export const programs:CoursesMap  ={ 'Accounting':[
  { courseCode: 'BUS110', courseName: 'Introduction to Business Administration', credits: 3.0,  },
  { courseCode: 'BCM101', courseName: 'Business Communication', credits: 3.0,  },
  { courseCode: 'LAW110', courseName: 'Business Law', credits: 3.0,  },
  { courseCode: 'BUS312', courseName: 'Ethics and Workplace Skills', credits: 3.0,  },
  { courseCode: 'MAT101', courseName: 'Introduction to Data Analysis', credits: 3.0,  },
  { courseCode: 'MIS121', courseName: 'Management Information Analytics', credits: 3.0,  },
  { courseCode: 'ACC101', courseName: 'Introductory Financial Accounting', credits: 3.0,  },
  { courseCode: 'ACC115', courseName: 'Introductory Management Accounting', credits: 3.0,  },
  { courseCode: 'FNC207', courseName: 'Corporate Finance', credits: 3.0,  },
  { courseCode: 'ACC215', courseName: 'Intermediate Management Accounting', credits: 3.0,  },
  { courseCode: 'FNC307', courseName: 'Applied Corporate Finance', credits: 3.0,  },
  { courseCode: 'PCP211', courseName: 'Payroll Compliance Legislation', credits: 3.0,  },
  { courseCode: 'ACC151', courseName: 'Intermediate Financial Reporting I', credits: 3.0,  },
  { courseCode: 'ACC215', courseName: 'Payroll Fundamentals I', credits: 3.0,  },
  { courseCode: 'ACC152', courseName: 'Intermediate Financial Reporting II', credits: 3.0,  },
  { courseCode: 'ACC251', courseName: 'Advanced Financial Reporting', credits: 3.0,  },
  { courseCode: 'PCP212', courseName: 'Payroll Fundamentals II', credits: 3.0,  },
  { courseCode: 'TAX201', courseName: 'Taxation', credits: 3.0,  },
  { courseCode: 'MIS315', courseName: 'Accounting Software Application – Sage 50', credits: 3.0,  },
  { courseCode: 'TAX311', courseName: 'Applied Corporate and Personal Taxation', credits: 3.0,  },
  { courseCode: 'ACC255', courseName: 'Audit & Assurance', credits: 3.0,  },
  { courseCode: 'BUS301', courseName: 'Business Applications', credits: 3.0,  },
  { courseCode: 'ACC501', courseName: 'Advanced Accounting and Finance Practicum I', credits: 6.0,  },
  { courseCode: 'ACC511', courseName: 'Advanced Accounting and Finance Practicum II', credits: 6.0,  }
],"Digital Marketing Diploma": [
    { courseCode: "MKT101", courseName: "Marketing and Advertising Management", credits: 6.0 },
    { courseCode: "BCM100", courseName: "Business Communication", credits: 3.0 },
    { courseCode: "BUS312", courseName: "Business Ethics", credits: 3.0 },
    { courseCode: "DMA115", courseName: "Foundation of Digital Marketing", credits: 6.0 },
    { courseCode: "WEB103", courseName: "Web Design and Optimization", credits: 14.0 },
    { courseCode: "ECM100", courseName: "E-Commerce Management", credits: 6.0 },
    { courseCode: "CMM210", courseName: "Content and Email Marketing", credits: 6.0 },
    { courseCode: "SMM212", courseName: "Social Media Marketing", credits: 9.0 },
    { courseCode: "SEM213", courseName: "Search Engine Marketing", credits: 6.0 },
    { courseCode: "SEO214", courseName: "Search Engine Optimization", credits: 6.0 },
    { courseCode: "DMA215", courseName: "Digital Marketing Analytics, CRM, and Automation Tools", credits: 9.0 },
    { courseCode: "MBM352", courseName: "Mobile Marketing", credits: 6.0 },
    { courseCode: "ENT305", courseName: "Entrepreneurship Development Strategies", credits: 6.0 },
    { courseCode: "DMP531", courseName: "Career Success and Employment Strategies", credits: 6.0 },
    { courseCode: "DMP532", courseName: "Practicum", credits: 6.0 }
  ],
  "Education Assistant Program": [
    { courseCode: "EAP100", courseName: "Educational Assistant Profession in Canada", credits: 3.0 },
    { courseCode: "CMP103", courseName: "MS Office Application", credits: 6.0 },
    { courseCode: "ACW100", courseName: "Academic Writing & Grammar", credits: 6.0 },
    { courseCode: "COM105", courseName: "Communication Skills for Educational Assistant", credits: 3.0 },
    { courseCode: "CAD113", courseName: "Child & Adolescent Development", credits: 3.0 },
    { courseCode: "CUR101", courseName: "Curriculum Development, Pedagogies and Technology", credits: 4.0 },
    { courseCode: "IDC123", courseName: "Inclusive & Differentiated Classroom", credits: 6.0 },
    { courseCode: "ABM101", courseName: "Assessment & Behavioral Management", credits: 3.0 },
    { courseCode: "NVC110", courseName: "Non-Violent Crisis Intervention", credits: 3.0 },
    { courseCode: "WRK100", courseName: "Working with Student Exceptionalities", credits: 6.0 },
    { courseCode: "TLS100", courseName: "Teaching Life Skills", credits: 6.0 },
    { courseCode: "TCH103", courseName: "Assistive Technology & Principles of Universal Design", credits: 6.0 },
    { courseCode: "CUR201", courseName: "Linguistic and Numeracy Learning of Children", credits: 4.0 },
    { courseCode: "AST100", courseName: "Applied Suicide Intervention Skills Training (ASIST)", credits: 2.0 },
    { courseCode: "EAP301", courseName: "Career and Employment Success Strategies", credits: 4.0 },
    { courseCode: "ETP120", courseName: "Entrepreneurship Development Strategies", credits: 4.0 },
    { courseCode: "EAP302", courseName: "Education Assistant Practicum", credits: 6.0 }
  ],
  "Human Services Diploma": [
    { courseCode: "HSP101", courseName: "Introduction to Human Services", credits: 3.0 },
    { courseCode: "ENG101", courseName: "Introduction to English Comprehension", credits: 3.0 },
    { courseCode: "HSP110", courseName: "Interpersonal Communication", credits: 3.0 },
    { courseCode: "HSP200", courseName: "Understanding Diversity and Inclusion", credits: 3.0 },
    { courseCode: "HSP102", courseName: "Social Welfare and Services in Canada", credits: 3.0 },
    { courseCode: "PSY115", courseName: "Psychology of Human Development", credits: 3.0 },
    { courseCode: "HSP205", courseName: "Interviews and Counselling Skills", credits: 3.0 },
    { courseCode: "HSP204", courseName: "Crisis Intervention & Management", credits: 3.0 },
    { courseCode: "HSP230", courseName: "Family Systems and Support", credits: 3.0 },
    { courseCode: "PSY101", courseName: "Introduction to Psychology", credits: 3.0 },
    { courseCode: "HSP236", courseName: "Introduction to Disability and Behaviour Management", credits: 3.0 },
    { courseCode: "HSP220", courseName: "Working with Vulnerable Populations", credits: 3.0 },
    { courseCode: "HSP290", courseName: "Case Management Skills", credits: 3.0 },
    { courseCode: "HSP300", courseName: "Indigenous People and Culture", credits: 3.0 },
    { courseCode: "PSY400", courseName: "Addiction, Mental Health, and Treatment", credits: 3.0 },
    { courseCode: "HSP345", courseName: "Working with Newcomers and Immigrants", credits: 3.0 },
    { courseCode: "PHL352", courseName: "Professionalism and Ethics in Human Services", credits: 3.0 },
    { courseCode: "SOC101", courseName: "Introduction to Sociology", credits: 3.0 },
    { courseCode: "HSP210", courseName: "Community Development and Engagement", credits: 3.0 },
    { courseCode: "HSP111", courseName: "Human Services Practicum I", credits: 6.0 },
    { courseCode: "HSP112", courseName: "Human Services Practicum II", credits: 6.0 }
  ],
  "Medical Office Administration": [
    { courseCode: "MSO100", courseName: "MS Office Application", credits: 6.0 },
    { courseCode: "BCM100", courseName: "Business Communication", credits: 3.0 },
    { courseCode: "HTC102", courseName: "Canadian Healthcare System, Ethics & Law", credits: 6.0 },
    { courseCode: "MOA110", courseName: "Medical Office & Health Unit Administrative Procedure", credits: 6.0 },
    { courseCode: "MTE112", courseName: "Medical Terminology", credits: 6.0 },
    { courseCode: "ANT110", courseName: "Applied Anatomy, Physiology, and Pharmacology for Medical Administrator", credits: 6.0 },
    { courseCode: "PSM100", courseName: "Patients Services Management", credits: 3.0 },
    { courseCode: "MDB103", courseName: "Medical Billing, Coding & Transcription", credits: 6.0 },
    { courseCode: "EMR105", courseName: "Electronic Medical Records Management", credits: 3.0 },
    { courseCode: "CLN100", courseName: "Clinical Procedures", credits: 4.0 },
    { courseCode: "FAD101", courseName: "First Aid & CPR Training", credits: 3.0 },
    { courseCode: "ETP300", courseName: "Entrepreneurship Development", credits: 3.0 },
    { courseCode: "MOP305", courseName: "Career and Employment Success Strategies", credits: 3.0 },
    { courseCode: "MOP352", courseName: "Medical Office Practicum", credits: 6.0 }
  ],
  "Pharmacy Technician": [
    { courseCode: "MSO100", courseName: "MS Office Application", credits: 6.0 },
    { courseCode: "BCM100", courseName: "Business Communication", credits: 3.0 },
    { courseCode: "HTC102", courseName: "Canadian Healthcare System, Ethics & Law", credits: 6.0 },
    { courseCode: "MDT101", courseName: "Medical Terminology", credits: 6.0 },
    { courseCode: "ANT112", courseName: "Applied Anatomy, Physiology, & Pharmacology", credits: 6.0 },
    { courseCode: "PHM101", courseName: "Pharmaceutical Calculations", credits: 3.0 },
    { courseCode: "PHM142", courseName: "Pharmacy Software-Kroll (or alternatives)", credits: 3.0 },
    { courseCode: "PHM151", courseName: "Pharmacy Computer Applications & Billing", credits: 3.0 },
    { courseCode: "PHM161", courseName: "Non-Sterile Compounding", credits: 3.0 },
    { courseCode: "PHM201", courseName: "Introduction to Hospital Pharmacy", credits: 3.0 },
    { courseCode: "PHM204", courseName: "Community Pharmacy Dispensing and Lab", credits: 6.0 },
    { courseCode: "PHM203", courseName: "Institutional Pharmacy & Sterile Practice", credits: 3.0 },
    { courseCode: "PHM213", courseName: "Pharmacy Systems Management & Inventory Control", credits: 3.0 },
    { courseCode: "CPR101", courseName: "First Aid & CPR Training", credits: 3.0 },
    { courseCode: "PAR301", courseName: "Career and Employment Success Strategies", credits: 3.0 },
    { courseCode: "PAP315", courseName: "Practicum", credits: 6.0 }
  ],
   "Retail Management Program": [
    { courseCode: "BUS110", courseName: "Introduction to Business Administration", credits: 3.0 },
    { courseCode: "BCM101", courseName: "Business Communication", credits: 3.0 },
    { courseCode: "LAW110", courseName: "Business Law", credits: 3.0 },
    { courseCode: "MKT212", courseName: "Retail Business Ethics", credits: 3.0 },
    { courseCode: "MAT101", courseName: "Introduction to Marketing Data Analysis", credits: 3.0 },
    { courseCode: "MIS121", courseName: "Management Information System", credits: 3.0 },
    { courseCode: "ACC101", courseName: "Introductory Financial Accounting", credits: 3.0 },
    { courseCode: "ACC115", courseName: "Introductory Management Accounting", credits: 3.0 },
    { courseCode: "PCP101", courseName: "Payroll Compliance Legislation", credits: 3.0 },
    { courseCode: "BUS111", courseName: "Business Management & Organizational Behaviour", credits: 3.0 },
    { courseCode: "ECO101", courseName: "Introduction to Microeconomics", credits: 3.0 },
    { courseCode: "MKT201", courseName: "Introduction to Marketing", credits: 3.0 },
    { courseCode: "BUS201", courseName: "Consumer Behaviour and Customer Service", credits: 3.0 },
    { courseCode: "MKT215", courseName: "Retail Sales Management", credits: 3.0 },
    { courseCode: "MKT230", courseName: "Marketing Communications", credits: 3.0 },
    { courseCode: "LOS216", courseName: "Security and Loss Prevention Management", credits: 3.0 },
    { courseCode: "BUS222", courseName: "Business Logistics Management", credits: 3.0 },
    { courseCode: "FNC307", courseName: "Managing Diversity in the Workplace", credits: 3.0 },
    { courseCode: "HSP301", courseName: "Health and Safety in the Workplace", credits: 3.0 },
    { courseCode: "BUS305", courseName: "Problem Solving and Decision Making", credits: 3.0 },
    { courseCode: "RMP111", courseName: "Practicum I", credits: 6.0 },
    { courseCode: "RMP112", courseName: "Practicum II", credits: 6.0 }
  ]
}  as const;;

export function parseCourseString(courseString:string) {
  // Split the string at ' - '
  const parts = courseString.split(' - ');

  // Extract the course name (everything before the last ' - ')
  const courseName = parts.slice(0, -1).join(' - ');

  // The last part is the 'Last Attempt'
  const lastAttempt = parts[parts.length - 1];

  return {
    courseName,
    lastAttempt
  };
}

const normalize = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9\s]/gi, "").trim();

const nameSimilarity = (a: string, b: string): boolean => {
  const aWords = new Set(normalize(a).split(/\s+/));
  const bWords = new Set(normalize(b).split(/\s+/));

  // Count common words
  const commonWords = [...aWords].filter(word => bWords.has(word));

  return commonWords.length >= Math.min(2, Math.min(aWords.size, bWords.size));
};

export const getMatchingProgram = (programs:CoursesMap,csvData: CsvRow[]): string | null => {
  const studentCourseCodes = csvData.map(row => row["Course code"]);
  const studentCourseNames = csvData.map(row => row["Overall Class Name"] || row["Name"]);

  let bestMatch: { program: string; score: number } = { program: "", score: 0 };

  for (const program in programs) {
    const requiredCourses = programs[program];
    const requiredCodes = requiredCourses.map(c => c.courseCode);

    // Code match check
    const matchedCodes = requiredCodes.filter(code =>
      studentCourseCodes.includes(code)
    );
    const codeMatchScore = matchedCodes.length / requiredCodes.length;

    // Name match fallback
    const nameMatchCount = requiredCourses.filter(req =>
      studentCourseNames.some(studentName => nameSimilarity(req.courseName, studentName))
    ).length;
    const nameMatchScore = nameMatchCount / requiredCourses.length;

    const totalScore = Math.max(codeMatchScore, nameMatchScore); // prioritize full code match

    if (totalScore === 1) return program; // perfect match

    if (totalScore > bestMatch.score) {
      bestMatch = { program, score: totalScore };
    }
  }

  return bestMatch.score > 0.6 ? bestMatch.program : null; // return if at least 60% match
};


