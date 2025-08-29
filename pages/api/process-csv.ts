import { IncomingForm } from "formidable";
import Papa from "papaparse";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { kv } from "@vercel/kv";
// Disable body parsing for file upload

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const { sessionId } = req.query;
    if (!sessionId || Array.isArray(sessionId)) {
      return res.status(400).json({ error: "Invalid sessionId" });
    }

    const session = await kv.hgetall(`session:${sessionId}`) as any;
    if (!session?.data)
      return res.status(404).json({ error: "Session not found" });

    const data = JSON.parse(session.data);
    const TTL_MS = 1000 * 60 * 5;
    if (Date.now() - Number(session.created) > TTL_MS) {
      await kv.del(`session:${sessionId}`);
      return res.status(410).json({ error: "Session expired" });
    }

    res.status(200).json({ data });
  }

  try {
    const resp = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ multiples: true });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          // Resolve with error object, not Response
          return resolve({ error: "File upload failed.", status: 500 });
        }

        try {
          const classFile = Array.isArray(files.classData)
            ? files.classData[0]
            : files.classData;
          const attendanceFile = Array.isArray(files.attendance)
            ? files.attendance[0]
            : files.attendance;

          if (!classFile || !attendanceFile) {
            return resolve({
              error: "Both CSV files are required.",
              status: 400,
            });
          }

          const classData = parseCsvFile(classFile.filepath);
          const attendanceData = parseCsvFile(attendanceFile.filepath);

          const emailHeader = Object.keys(classData[0] || {}).find((key) =>
            key.toLowerCase().includes("email")
          );

          const courseNameToLmsId = new Map(
            classData.map((c) => [c["Name"]?.trim(), c["CLASSID"]?.trim()])
          );

          let idToEmail = new Map<string, string>();
          if (emailHeader) {
            idToEmail = new Map(
              classData.map((s) => {
                const id = s["STUDENTLMSID"]?.trim() || "";
                const email = s[emailHeader]?.trim() || "Email not found";
                return [id, email];
              })
            );
          } else {
            idToEmail = new Map(
              classData.map((s) => {
                const id = s["ID"]?.trim() || "";
                return [id, "Email not found"];
              })
            );
          }

          const result = attendanceData.map((row) => {
            const id = row["ID"]?.trim();
            const name = row["Name"]?.trim();
            const courseName = row["Course Name"]?.trim();
            const date = row["Date"]?.trim();
            const attendance = row["Percentage"]?.trim();
            const course_id =
              courseNameToLmsId.get(courseName) || "Unknown LMS ID";
            const email = idToEmail.get(id) || "Email not found";

            return {
              course_id,
              id,
              name,
              course_name: courseName,
              email,
              date,
              attendance,
            };
          });
          const sessionId = uuidv4();

          // await kv.hset(`session:${sessionId}`, {
          //   data: JSON.stringify(result),
          //   created: Date.now(),
          // });

          resolve({ data: result, status: 200 });
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    if ((resp as any).error) {
      return res
        .status((resp as any).status || 500)
        .json({ error: (resp as any).error });
    }
    console.log((resp as any).data);
    res.status(200).json((resp as any).data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function parseCsvFile(filePath: string) {
  const file = fs.readFileSync(filePath, "utf8");
  return Papa.parse(file, { header: true }).data as any[];
}
