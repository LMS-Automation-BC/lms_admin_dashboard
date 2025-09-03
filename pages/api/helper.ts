export function extractMonthYear(text: string): string | null {
  // Regex to match full or abbreviated month + 4-digit year
  console.log(text);
  const regex = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s(\d{4})\b/i;
  const match = text.match(regex);
  if (!match) return "";

  const month = match[1];
  const year = match[2];
  return `${month} ${year}`;
}