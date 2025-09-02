import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image

} from "@react-pdf/renderer";
import { CsvRow } from "./GradeParser";
import logo from "../../public/brookes_college.png";

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: '/fonts/OpenSans-Regular.ttf', fontWeight: 'normal', fontStyle: 'normal' },
    { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold', fontStyle: 'normal' },
    { src: '/fonts/OpenSans-Italic.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: '/fonts/OpenSans-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
     fontFamily: 'Open Sans',
    fontSize: 12,
    padding: 40,
    lineHeight: 1.5,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  tableCol: {
    flex: 1,
    paddingRight: 5,
  },
  actionsCol: {
    width: 80,
  },
  footerNote: {
    marginTop: 20,
    fontSize: 10,
    fontStyle: "italic",
  },
  logoRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
},

logo: {
  // width: 60,
  // height: 60,
},

verticalLine: {
  width: 1,
  height: 50,
  backgroundColor: "#000",
  marginHorizontal: 10,
},

institutionNameWrapper: {
  justifyContent: "center",
},

institutionName: {
  fontSize: 16,
  fontWeight: "bold",
  lineHeight: 1.2,
},

});

interface TranscriptProps {
  studentName?: string;
  program?: string | null;
  programStartDate?: string | null;
  enrollmentNo?: string;
  printDate: string;
  courses: CsvRow[];
  credits: number;
  cumulativeGpa: number;
  programStatus?: string;
}

const TranscriptPDF: React.FC<TranscriptProps> = ({
  studentName,
  program,
  programStartDate,
  enrollmentNo,
  printDate,
  courses,
  credits,
  cumulativeGpa,
  programStatus,
}) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.logoRow}>
     <Image
          style={styles.logo}
          src="https://localhost:3000/brookes_college.png"
        />
    <View style={styles.verticalLine} />
    <View style={styles.institutionNameWrapper}>
      <Text style={styles.institutionName}>Brookes</Text>
      <Text style={styles.institutionName}>College</Text>
    </View>
  </View>
      <Text style={styles.header}>Transcript of Academic Records</Text>

      {/* Student Info */}
      <View style={styles.section}>
        <Text>Student Name: {studentName}</Text>
        <Text>Program: {program}</Text>
        <Text>Program Start Date: {programStartDate}</Text>
        <Text>Enrollment No: {enrollmentNo}</Text>
        <Text>Transcript Print Date: {printDate}</Text>
        <Text>Program Status: {programStatus || "N/A"}</Text>
      </View>

      {/* Courses Table */}
      <View>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCol}>Course Code</Text>
          <Text style={styles.tableCol}>Course Name</Text>
          <Text style={styles.tableCol}>Last Attempt</Text>
          <Text style={styles.tableCol}>Credits</Text>
          <Text style={styles.tableCol}>Letter Grade</Text>
          <Text style={styles.tableCol}>Grade Point</Text>
        </View>

        {courses.map((course, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{course["Course code"]}</Text>
            <Text style={styles.tableCol}>{course["Default Class Name"]}</Text>
            <Text style={styles.tableCol}>
              {course["Overall Class Name"]?.split(" - ").slice(-1)[0].trim()}
            </Text>
            <Text style={styles.tableCol}>{course.Credits}</Text>
            <Text style={styles.tableCol}>{course.Grade}</Text>
            <Text style={styles.tableCol}>{course["Grade Point"]}</Text>
          </View>
        ))}
      </View>

      {/* Credits and GPA */}
      <View style={{ marginTop: 10 }}>
        <Text>Credits Earned: {credits}</Text>
        <Text>Cumulative GPA: {cumulativeGpa}</Text>
      </View>

      {/* Notes */}
      <View style={styles.footerNote}>
        <Text>
          Note:
          {"\n"}1. The document is official only if original and bears an authorized signature with a college stamp.
          {"\n"}2. Information to assist in evaluating the transcript is overleaf.
        </Text>
        <Text>{"\n"}Dr. Tomi Adeyemi{"\n"}President</Text>
      </View>
    </Page>
  </Document>
);

export default TranscriptPDF;
