// app/transcript/page.tsx
import { Suspense } from "react";
import TranscriptPageClient from "./Transcript";

export default function TranscriptPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {

  const studentId = searchParams?.studentId;
  const program = searchParams?.program;
  const name = searchParams?.studentName;
  if(studentId && program && name)
  return (
    <Suspense fallback={<p>Loading transcript...</p>}>
      <TranscriptPageClient studentId={studentId} program={program} name={name} />
    </Suspense>
  );
}
