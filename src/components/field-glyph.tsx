import type { FieldSlug } from "@/lib/sciences";
import { cn } from "@/lib/utils";

const paths: Record<FieldSlug, string> = {
  physics:
    "M16 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M6 16c4-8 16-8 20 0 M6 16c4 8 16 8 20 0 M16 6c8 4 8 16 0 20 M16 6c-8 4-8 16 0 20",
  chemistry:
    "M10 8h12l-2 6 4 10H8l4-10z M12 8V5h8v3",
  biology:
    "M16 6c6 3 8 10 6 16-4-2-8-2-12 0-2-6 0-13 6-16z M16 10c2 2 3 5 2 9 M16 10c-2 2-3 5-2 9",
  astronomy:
    "M16 5v22 M5 16h22 M8.5 8.5l15 15 M23.5 8.5l-15 15 M16 16m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0",
  earth:
    "M16 16m-11 0a11 11 0 1 0 22 0a11 11 0 1 0-22 0 M16 5c4 4 4 18 0 22 M16 5c-4 4-4 18 0 22 M6 12h20 M6 20h20",
  mathematics:
    "M6 22 L14 8 M18 8h8 M18 16h8 M7 12h6",
  computing:
    "M8 10h4v4H8z M14 10h4v4h-4z M20 10h4v4h-4z M11 14v4h10v-4 M14 18h4v4h-4z",
  medicine:
    "M13 6h6v6h6v6h-6v6h-6v-6H7v-6h6z",
  neuroscience:
    "M16 5c5 2 8 7 7 13-3 1-6 0-8-3 M16 5c-5 2-8 7-7 13 3 1 6 0 8-3 M16 15c0 4-2 8-6 11 M16 15c0 4 2 8 6 11",
  ecology:
    "M5 24h22 M8 24V14l8-8 8 8v10 M16 24V12 M12 18h8",
  materials:
    "M16 5l11 6.5v9L16 27 5 20.5v-9z M16 5v22 M5 11.5l11 6.5 11-6.5",
  psychology:
    "M11 16a5 5 0 1 1 0.1 0 M21 16a5 5 0 1 1 0.1 0 M16 16m-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0",
  quantum:
    "M16 16m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M6 16h20 M16 6c4 3 6 7 6 10 M16 6c-4 3-6 7-6 10 M10 12h12 M10 20h12",
};

export function FieldGlyph({
  slug,
  className,
}: {
  slug: FieldSlug;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-10 text-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[slug]} />
    </svg>
  );
}
