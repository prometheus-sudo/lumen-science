import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FIELD_SLUGS } from "@/lib/sciences-types";

const ROOT = path.join(process.cwd(), "src/lib/curriculum/longform");

function safeSegment(s: string) {
  return /^[a-z0-9_-]+$/i.test(s);
}

export const getLongformLesson = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { fieldSlug?: string; conceptId?: string };
    if (!d?.fieldSlug || !d?.conceptId) throw new Error("fieldSlug and conceptId required");
    if (!FIELD_SLUGS.includes(d.fieldSlug as (typeof FIELD_SLUGS)[number])) {
      throw new Error("Unknown field");
    }
    if (!safeSegment(d.fieldSlug) || !safeSegment(d.conceptId)) {
      throw new Error("Invalid id");
    }
    return { fieldSlug: d.fieldSlug, conceptId: d.conceptId };
  })
  .handler(async ({ data }) => {
    const file = path.join(ROOT, data.fieldSlug, `${data.conceptId}.md`);
    try {
      const body = await readFile(file, "utf8");
      const words = body.trim().split(/\s+/).filter(Boolean).length;
      return { ok: true as const, body, words };
    } catch {
      return { ok: false as const, body: null as string | null, words: 0 };
    }
  });
