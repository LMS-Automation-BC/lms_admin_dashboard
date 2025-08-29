import { NextRequest } from 'next/server';
import { IncomingForm } from 'formidable';
import Papa from 'papaparse';
import * as fs from 'fs';

// Disable body parsing for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  return new Promise((resolve) => {
    const form = new IncomingForm({ multiples: true });

    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        return resolve(
          new Response(JSON.stringify({ error: 'File upload failed.' }), {
            status: 500,
          })
        );
      }

      try {
        const classFile = Array.isArray(files.classData) ? files.classData[0] : files.classData;
        const attendanceFile = Array.isArray(files.attendance) ? files.attendance[0] : files.attendance;

        if (!classFile || !attendanceFile) {
          return resolve(
            new Response(JSON.stringify({ error: 'Both CSV files are required.' }), {
              status: 400,
            })
          );
        }

        const classData = parseCsvFile(classFile.filepath);
        const attendanceData = parseCsvFile(attendanceFile.filepath);

        const emailHeader = Object.keys(classData[0] || {}).find((key) =>
          key.toLowerCase().includes('email')
        );

        const courseNameToLmsId = new Map(
          classData.map((c) => [c['Name']?.trim(), c['CLASSID']?.trim()])
        );

        let idToEmail = new Map<string, string>();
        if (emailHeader) {
          idToEmail = new Map(
            classData.map((s) => {
              const id = s['STUDENTLMSID']?.trim() || '';
              const email = s[emailHeader]?.trim() || 'Email not found';
              return [id, email];
            })
          );
        } else {
          idToEmail = new Map(
            classData.map((s) => {
              const id = s['ID']?.trim() || '';
              return [id, 'Email not found'];
            })
          );
        }

        const result = attendanceData.map((row) => {
          const id = row['ID']?.trim();
          const name = row['Name']?.trim();
          const courseName = row['Course Name']?.trim();
          const date = row['Date']?.trim();
          const attendance = row['Percentage']?.trim();
          const course_id = courseNameToLmsId.get(courseName) || 'Unknown LMS ID';
          const email = idToEmail.get(id) || 'Email not found';

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

        return resolve(
          new Response(JSON.stringify(result), {
            status: 200,
          })
        );
      } catch (error) {
        console.error(error);
        return resolve(
          new Response(JSON.stringify({ error: 'Processing failed.' }), {
            status: 500,
          })
        );
      }
    });
  });
}

function parseCsvFile(filePath: string) {
  const file = fs.readFileSync(filePath, 'utf8');
  return Papa.parse(file, { header: true }).data as any[];
}
