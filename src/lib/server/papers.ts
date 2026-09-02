import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { getField, getConcept } from "@/lib/sciences";
import { searchOpenLiterature, type LiteratureWork } from "@/lib/literature";
import { authorsToString } from "@/lib/authors-display";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function cacheKey(kind: string, query: string, rows: number): string {
  return `${kind}:${query.trim().toLowerCase().slice(0, 180)}:${rows}`;
}

function normalizeWork(raw: unknown): LiteratureWork | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw as Record<string, unknown>;
  const title = typeof w.title === "string" ? w.title : "";
  if (!title) return null;
  return {
    id: String(w.id ?? title.slice(0, 80)),
    title,
    year: typeof w.year === "number" ? w.year : null,
    citedBy: typeof w.citedBy === "number" ? w.citedBy : Number(w.citedBy) || 0,
    doi: typeof w.doi === "string" ? w.doi : null,
    url: typeof w.url === "string" ? w.url : null,
    pdfUrl: typeof w.pdfUrl === "string" ? w.pdfUrl : null,
    authors: authorsToString(w.authors),
    abstract: typeof w.abstract === "string" ? w.abstract : "",
    venue: typeof w.venue === "string" ? w.venue : "",
    source: (w.source as LiteratureWork["source"]) || "Crossref (CC)",
    license: typeof w.license === "string" ? w.license : null,
  };
}

function asWorks(raw: unknown): LiteratureWork[] {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWork).filter((w): w is LiteratureWork => w != null);
}

export async function loadOpenPapers(query: string, rows = 8): Promise<LiteratureWork[]> {
  const key = cacheKey("oa", query, rows);
  try {
    const sql = await getSql();
    const hit = await sql<{ payload: unknown; created_at: string }>`
      select payload, created_at from paper_cache where cache_key = ${key}
    `;
    const row = hit[0];
    if (row && Date.now() - new Date(row.created_at).getTime() < CACHE_TTL_MS) {
      const works = asWorks(row.payload);
      if (works.length) return works;
    }
  } catch {
    /* cache optional */
  }

  const works = asWorks(await searchOpenLiterature(query, rows));

  try {
    const sql = await getSql();
    const payload = JSON.stringify(works);
    await sql`
      insert into paper_cache (cache_key, payload, created_at)
      values (${key}, ${payload}::jsonb, now())
      on conflict (cache_key) do update set payload = excluded.payload, created_at = now()
    `;
  } catch {
    /* ignore */
  }

  return works;
}

export const fetchFieldPapers = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<LiteratureWork[]> => {
    const field = getField(data.slug);
    if (!field) return [];
    try {
      return await loadOpenPapers(field.searchQuery, 12);
    } catch {
      return [];
    }
  });

export const fetchConceptPapers = createServerFn({ method: "GET" })
  .validator((input: { slug: string; conceptId: string }) => input)
  .handler(async ({ data }): Promise<LiteratureWork[]> => {
    const found = getConcept(data.slug, data.conceptId);
    if (!found) return [];
    const q = `${found.field.name} ${found.concept.title} review`;
    try {
      return await loadOpenPapers(q, 8);
    } catch {
      return [];
    }
  });

export const searchPapers = createServerFn({ method: "GET" })
  .validator((input: { query: string }) => ({
    query: input.query.trim().slice(0, 200),
  }))
  .handler(async ({ data }): Promise<LiteratureWork[]> => {
    if (data.query.length < 2) return [];
    try {
      return await loadOpenPapers(data.query, 16);
    } catch {
      return [];
    }
  });

export function formatPapersForPrompt(works: LiteratureWork[], limit = 6): string {
  if (!works.length) return "(No open-access records were retrieved for this query.)";
  return works
    .slice(0, limit)
    .map((w, i) => {
      const cite = [
        authorsToString(w.authors) || "Unknown authors",
        w.year ? `(${w.year})` : "",
        w.title,
        w.venue || "",
        w.doi ? `doi:${w.doi}` : "",
        w.source,
        w.url ?? "",
      ]
        .filter(Boolean)
        .join(" · ");
      const abs = w.abstract ? `\nAbstract: ${w.abstract.slice(0, 400)}` : "";
      return `${i + 1}. ${cite}${abs}`;
    })
    .join("\n\n");
}
