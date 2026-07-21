import { format, parseISO } from "date-fns";
import SecondPage from "@/app/components/SecondPage";
import { CsvRow } from "@/app/components/GradeParser";
import ContactColumns from "@/app/students/transcripts/GradeOrganization";
import { extractMonthYear } from "@/app/grades/helpers/grade";

interface TranscriptPDFProps {
	studentName: string | undefined;
	program: string | null;
	enrollmentNo: string | undefined;
	coursesTranscript: CsvRow[];
	unfinishedCourses: Course[];
	creditsEarned: number;
	totalCredits: number;
	cumulativeGpa: number;
	programStatus: string;
	hasFail: boolean;
	rePrint: boolean;
	programStart: string;
	transcriptPrint: string;
	transcriptRePrint: string;
}

export const formatDateWithHyphen = (dateStr: string) => {
	const date = parseISO(dateStr);
	return format(date, "dd-MMMM-yyyy");
};

export default function TranscriptPDF({
	studentName,
	program,
	enrollmentNo,
	coursesTranscript,
	unfinishedCourses,
	creditsEarned,
	totalCredits,
	cumulativeGpa,
	programStatus,
	hasFail,
	rePrint,
	programStart,
	transcriptPrint,
	transcriptRePrint,
}: TranscriptPDFProps) {
	const defaultClassCount = coursesTranscript.reduce<Record<string, number>>(
		(acc, row) => {
			const className = row["Default_Course_Name"];
			if (className) acc[className] = (acc[className] || 0) + 1;
			return acc;
		},
		{},
	);

	const isUnfinished = (row: CsvRow) =>
		row["Default_Course_Name"] &&
		unfinishedCourses.some(
			(course) =>
				course.Course_Name.toLowerCase().trim() ===
				row["Default_Course_Name"].toLowerCase().trim(),
		);

	const isDuplicate = (row: CsvRow) =>
		row["Default_Course_Name"] &&
		defaultClassCount[row["Default_Course_Name"]] > 1;

	return (
		<div>
			<div
				className="transcript-container"
				style={{ pageBreakAfter: "always" }}
			>
				<div className="header">
					<img
						src="/brookes_college.png"
						alt="Institution Logo"
						className="logo"
					/>
					<div className="vertical-line" />
					<div className="institution-name-wrapper">
						<div className="institution-name brookes">Brookes</div>
						<div className="institution-name college">College</div>
					</div>
				</div>

				<div style={{ textAlign: "center" }}>
					<div className="title">TRANSCRIPT OF ACADEMIC RECORDS</div>
				</div>

				<div className="info-row">
					<div className="left">
						<span style={{ fontWeight: "550" }}>Student Name</span>: {studentName}
					</div>
					{rePrint ? (
						<div className="right">
							<span style={{ fontWeight: 550 }}>Program Start Date</span>: {" "}
							{formatDateWithHyphen(programStart)}
						</div>
					) : (
						<div className="right">
							<span style={{ fontWeight: "550" }}>Program:</span> {program}
						</div>
					)}
				</div>
				<div className="info-row">
					<div className="left">
						<span style={{ fontWeight: "550" }}>Enrollment No:</span>{" "}
						{enrollmentNo}
					</div>
					<div className="right">
						<span style={{ fontWeight: 550 }}>
							{rePrint ? "Transcript Print Date" : "Program Start Date"}
						</span>
						: {" "}
						{formatDateWithHyphen(rePrint ? transcriptPrint : programStart)}
					</div>
				</div>
				<div className="info-row">
					<div className="left">
						{rePrint ? (
							<div className="right">
								<span style={{ fontWeight: "550" }}>Program:</span> {program}
							</div>
						) : null}
					</div>

					<div className="right">
						<span style={{ fontWeight: 550 }}>
							{rePrint ? "Transcript RePrint Date" : "Transcript Print Date"}
						</span>
						: {" "}
						{formatDateWithHyphen(
							rePrint ? transcriptRePrint : transcriptPrint,
						)}
					</div>
				</div>
				<div className="transcript-body">
					{coursesTranscript.length > 0 && (
						<table className="grade-table">
							<thead>
								<tr>
									<th className="course-code">Course Code</th>
									<th className="course-name">Course Name</th>
									<th className="last-attempt">Last Attempt</th>
									<th className="credits">Credits</th>
									<th className="letter-grade">Letter Grade</th>
									<th className="grade-point">Grade Point</th>
								</tr>
							</thead>
							<tbody>
								{coursesTranscript.map((row, index) => (
									<tr key={index}>
										<td className="course-code">{row["Course_Code"]}</td>
										<td
											title={row["Course_Name"]}
											className={`course-name ${
												isDuplicate(row)
													? "duplicate-highlight"
													: isUnfinished(row)
														? "unfinished-highlight"
														: row.isInProgram === false
															? "notinprogram"
															: ""
											}`}
										>
											{row["Default_Course_Name"]}
										</td>
										<td className="last-attempt">
											{(() => {
												const value = row["Last_Attempt"] ?? row["Semester"];
												return value ? extractMonthYear(value) : "";
											})()}
										</td>
										<td className="credits">{row["Credits"]}</td>
										<td className="letter-grade">{row["Grade"]}</td>
										<td className="grade-point">
											{row["Grade"] !== "TR" && row["Grade"] !== "RW"
												? Number(row["Grade_Point"]).toFixed(1)
												: row["Grade_Point"]}
										</td>
									</tr>
								))}
								{programStatus != "Completed" ? (
									<tr>
										<td colSpan={4} style={{ textAlign: "center" }}>
											Credits Earned
										</td>
										<td colSpan={2} style={{ textAlign: "center" }}>
											{creditsEarned}
										</td>
									</tr>
								) : null}
								<tr>
									<td colSpan={4} style={{ textAlign: "center" }}>
										Total Credits
									</td>
									<td colSpan={2} style={{ textAlign: "center" }}>
										{totalCredits}
									</td>
								</tr>
								<tr>
									<td colSpan={4} style={{ textAlign: "center" }}>
										Cumulative Grade Point Average (CGPA)
									</td>
									<td colSpan={2} style={{ textAlign: "center" }}>
										{(Math.round(cumulativeGpa * 1000) / 1000).toFixed(2)}
									</td>
								</tr>
								<tr>
									<td colSpan={4} style={{ textAlign: "center" }}>
										Program Status {hasFail}
									</td>
									<td colSpan={2} style={{ textAlign: "center" }}>
										{programStatus || "Completed"}
									</td>
								</tr>
							</tbody>
						</table>
					)}
				</div>
				<div className="note">
					<p
						style={{
							textDecoration: "underline",
							fontWeight: "bold",
							fontStyle: "italic",
							fontSize: "11pt",
						}}
					>
						Note:
					</p>
					<ol
						style={{
							fontStyle: "italic",
							paddingBottom: "10px",
							fontSize: "11pt",
						}}
					>
						<li>
							1. The document is official only if original and bears an
							authorized signature with a college stamp.
						</li>
						<li>
							2. Information to assist in evaluating the transcript is overleaf.
						</li>
					</ol>
				</div>
				<div />
				<div
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						width: "100%",
						margin: 0,
					}}
					className="footer"
				>
					<ContactColumns showPresident={true}></ContactColumns>
				</div>
			</div>

			<div className="transcript-container">
				<SecondPage></SecondPage>
			</div>
		</div>
	);
}
