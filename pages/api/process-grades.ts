import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import Papa from "papaparse";
import { Redis } from "@upstash/redis";
import { extractMonthYear } from "./helper";

const redis = new Redis({
  url:
    // process.env.UPSTASH_REDIS_REST_URL ||
    "https://trusty-zebra-41482.upstash.io",
  token:
    // process.env.UPSTASH_REDIS_REST_TOKEN ||
    "AaIKAAIncDEwYzUyYjVhM2NlODg0ZmEyODVjYmIwN2I4NGZmNWI2NnAxNDE0ODI",
});
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse the form with formidable
const parseForm = (
  req: NextApiRequest
): Promise<{ fileContent: string; sessionId: string | undefined }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);

      const file = (files.file?.[0] || files.file) as any;
      const sessionId = Array.isArray(fields.sessionId)
        ? fields.sessionId[0]
        : fields.sessionId;

      //   if (!file || !file.filepath) {
      //     return reject(new Error("No file uploaded"));
      //   }

      try {
        const fileContent = fs.readFileSync(file.filepath, "utf8");
        resolve({ fileContent, sessionId });
      } catch (readErr) {
        reject(readErr);
      }
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === "POST") {
    const { fileContent, sessionId } = await parseForm(req);
    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }
    const parsed = Papa.parse<StudentRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    const users = parsed.data.map((row: any) => {
      return {
        name: `${row["First name"]} ${row["Last name"]}`,
        id: row["Student ID"],
      };
    }).filter(user => user.id != null && user.id !== "");
    console.log(users);
    const uniqueUsers = Array.from(
      new Map(users.map((user) => [user.id, user])).values()
    );
    await redis.set(`session:${sessionId}:users`, JSON.stringify(uniqueUsers), {
      ex: 60 * 60 * 24,
    });
    const groupedByStudent: Record<string, StudentRow[]> = {};

    parsed.data.forEach((row: StudentRow) => {
      const studentId = row["Student ID"];
      if (!studentId) return;

      if (!groupedByStudent[studentId]) {
        groupedByStudent[studentId] = [];
      }

      groupedByStudent[studentId].push(row);
    });

    // 2. Store each group in Redis with 24h expiry
    const storePromises = Object.entries(groupedByStudent).map(
      ([studentId, rows]) => {
        const key = `student:${studentId}`;
        return redis.set(key, rows, { ex: 60 * 60 * 24 }); // 24 hours
      }
    );
    let redisResponse = await Promise.all(storePromises.filter(Boolean));
    return res.status(200).json({ users: uniqueUsers });
  }
  if (method === "GET") {
    const { id, sessionId } = req.query;
    if (id) {
      let data:any[] | null = await redis.get(`student:${id}`);
      if (!data) return res.status(404).json({ error: "Student not found" });
      data = data.filter(x => x["Grade"])
      console.log(data);
      data = data?.map(x => {
        //console.log(x);
        x["Last Attempt"] = x["Overall Class Name"] || x['Name'] ? extractMonthYear(x["Overall Class Name"]|| x['Name']):'';
        return x;  
      })
      return res.status(200).json({ student: data });
    }
    if (sessionId) {
      const usersJson = await redis.get(`session:${sessionId}:users`);

      if (!usersJson) return res.status(404).json({ error: "No users found" });
      return res.status(200).json({ users: usersJson });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
interface StudentRow {
  "First name": string;
  "Last name": string;
  "Full Name": string;
  "Program Name": string;
  "Program Start Date": string;
  "Student ID": string;
  "Overall Class Name": string;
  "Course code": string;
  Semester: string;
  Credits: number;
  "Percent%": number;
  Grade: string;
  "Enrolled at": string;
}
