import React, { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { CsvRow } from "./GradeParser";


// ✅ Register fonts (ensure these are available at /public/fonts)
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "/fonts/OpenSans-Regular.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    {
      src: "/fonts/OpenSans-Bold.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
    {
      src: "/fonts/OpenSans-Italic.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: "/fonts/OpenSans-BoldItalic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Open Sans",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.25,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
  },
  section: {
    marginBottom: 10,
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
    width: 60,
    height: 60,
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
  institutionNameBrookes: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 1.2,
    color: "#06294f",
  },
  institutionNameCollege: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 1.2,
    color: "#ff7f00",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  leftText: {
    flex: 1,
    textAlign: "left",
  },
  rightText: {
    flex: 1,
    textAlign: "right",
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
  },
  tableRow: {
    flexDirection: "row",
  },
  courseCodeCol: {
    flex: 0.8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    fontSize: 8,
  },
  courseNameCol: {
    flex: 3,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    fontSize: 8,
  },
  lastAttemptCol: {
    flex: 1.0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    fontSize: 8,
  },
  creditsCol: {
    flex: 0.7,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    fontSize: 8,
    textAlign: "center",
  },
  letterGradeCol: {
    flex: 0.8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    fontSize: 8,
    textAlign: "center",
  },
  gradePointCol: {
    flex: 0.8,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    fontSize: 8,
    textAlign: "center",
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
            src="https://lmsadmindashboard.vercel.app/brookes_college.png"
          />
          <View style={styles.verticalLine} />
          <View style={styles.institutionNameWrapper}>
            <Text style={styles.institutionNameBrookes}>Brookes</Text>
            <Text style={styles.institutionNameCollege}>College</Text>
          </View>
        </View>
        <Text>Debug ID: {JSON.stringify(courses[0])}</Text>
        <Text style={styles.header}>Transcript of Academic Records</Text>

        {/* Student Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.leftText}>Student Name: {studentName}</Text>
            <Text style={styles.rightText}>Program: {program}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rightText}>
              Program Start Date: {programStartDate}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.leftText}>Enrollment No: {enrollmentNo}</Text>
            <Text style={styles.rightText}>
              Transcript Print Date: {printDate}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.leftText}>
              Program Status: {programStatus || "N/A"}
            </Text>
          </View>
        </View>

        {/* Courses Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.courseCodeCol}>Course Code</Text>
            <Text style={styles.courseNameCol}>Course Name</Text>
            <Text style={styles.lastAttemptCol}>Last Attempt</Text>
            <Text style={styles.creditsCol}>Credits</Text>
            <Text style={styles.letterGradeCol}>Letter Grade</Text>
            <Text style={styles.gradePointCol}>Grade Point</Text>
          </View>
          {courses.map((course, index) => (
            <View style={styles.tableRow} key={index}>
           <Text style={styles.courseCodeCol}>Course Code</Text>
            <Text style={styles.courseNameCol}>Course Name</Text>
            <Text style={styles.lastAttemptCol}>Last Attempt</Text>
            <Text style={styles.creditsCol}>Credits</Text>
            <Text style={styles.letterGradeCol}>Letter Grade</Text>
            <Text style={styles.gradePointCol}>Grade Point</Text>
            </View>
            //<View style={styles.tableRow} key={index}>
            //   <Text style={styles.courseCodeCol}>{course.courseCode || ''}</Text>
            //   <Text style={styles.courseNameCol}>{course.courseName || ''}</Text>
            //   <Text style={styles.lastAttemptCol}>{course.lastAttempt || ''}</Text>
            //   <Text style={styles.creditsCol}>{course.credits || 0}</Text>
            //   <Text style={styles.letterGradeCol}>{course.grade || ''}</Text>
            //   <Text style={styles.gradePointCol}>{course.gradePoint || ''}</Text>
             //</View>
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
            {"\n"}1. The document is official only if original and bears an
            authorized signature with a college stamp.
            {"\n"}2. Information to assist in evaluating the transcript is
            overleaf.
          </Text>
          <Text>
            {"\n"}Dr. Tomi Adeyemi{"\n"}President
          </Text>
        </View>
      </Page>
    </Document>
  )

export default TranscriptPDF;
