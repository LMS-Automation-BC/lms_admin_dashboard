// pages/api/programs.ts
import { redis } from "@/lib/redis";
import type { NextApiRequest, NextApiResponse } from "next";

type Course = {
  courseCode: string;
  courseName: string;
  credits: number;
};

type ProgramsMap = {
  [programName: string]: Course[];
};

const REDIS_KEY = "programs_data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        {
          const data = await redis.get(REDIS_KEY) as any;
          const programs: ProgramsMap = data ? data : {};
          res.status(200).json(programs);
        }
        break;

      case "POST":
        {
          // Replace entire programs object
          const programs: ProgramsMap = req.body;
          if (!programs || typeof programs !== "object") {
            return res.status(400).json({ error: "Invalid JSON body" });
          }
          await redis.set(REDIS_KEY, JSON.stringify(programs));
          res.status(200).json({ message: "Programs saved successfully" });
        }
        break;

      case "PATCH":
        {
          // Update a single program's courses
          const { programName, courses } = req.body as {
            programName?: string;
            courses?: Course[];
          };

          if (!programName || !Array.isArray(courses)) {
            return res
              .status(400)
              .json({ error: "Missing programName or courses array" });
          }

          const data = await redis.get(REDIS_KEY) as any;
          const programs: ProgramsMap = data ? data : {};
          programs[programName] = courses;
          await redis.set(REDIS_KEY, JSON.stringify(programs));
          res.status(200).json({ message: `Program ${programName} updated` });
        }
        break;

      case "DELETE":
        {
          // Delete a single program by name passed in query string
          const programName = req.query.programName as string | undefined;
          if (!programName) {
            return res.status(400).json({ error: "Missing programName query" });
          }

          const data = await redis.get(REDIS_KEY) as any;
          const programs: ProgramsMap = data ? JSON.parse(data) : {};
          if (!programs[programName]) {
            return res.status(404).json({ error: "Program not found" });
          }

          delete programs[programName];
          await redis.set(REDIS_KEY, JSON.stringify(programs));
          res.status(200).json({ message: `Program ${programName} deleted` });
        }
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
