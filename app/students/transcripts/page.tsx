// app/students/transcripts/page.tsx
import { Suspense } from "react";
import TranscriptPageClient from "./Transcript";

export default async function TranscriptPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ Await searchParams before using it
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;
  const program = resolvedParams.program as string;
  const name = resolvedParams.studentName as string;

  return (
    <Suspense fallback={<p>Loading transcript...</p>}>
      <TranscriptPageClient
        studentId={studentId}
        program={program}
        name={name}
      />
    </Suspense>
  );
}
