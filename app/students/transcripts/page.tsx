// app/transcript/page.tsx
import { Suspense } from "react";
import TranscriptPageClient from "./Transcript";


export default function TranscriptPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const studentId = searchParams.studentId;
  const program = searchParams.program;
  const name = searchParams.studentName;

  return (
    <Suspense fallback={<p>Loading transcript...</p>}>
      <TranscriptPageClient studentId={studentId} program={program} name={name} />
    </Suspense>
  );
}
