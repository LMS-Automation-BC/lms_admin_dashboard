// app/transcript/page.tsx
import { Suspense } from "react";
import TranscriptPageClient from "./Transcript";

export default function TranscriptPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const studentId = searchParams?.studentId as string;
  const program = searchParams?.program as string;
  const name = searchParams?.studentName as string;

  return (
    <Suspense fallback={<p>Loading transcript...</p>}>
      <TranscriptPageClient studentId={studentId} program={program} name={name} />
    </Suspense>
  );
}
