export type LiteratureSource =
  | "arXiv"
  | "PubMed Central"
  | "DOAJ"
  | "PLOS"
  | "Zenodo"
  | "Crossref (CC)"
  | "Preprint";

export type LiteratureWork = {
  id: string;
  title: string;
  year: number | null;
  citedBy: number;
  doi: string | null;
  url: string | null;
  pdfUrl: string | null;
  authors: string;
  abstract: string;
  venue: string;
  source: LiteratureSource;
  license: string | null;
};

const UA = "Lumen Science Academy (https://github.com/prometheus-sudo/lumen-science)";
const TIMEOUT_MS = 8000;

function formatAuthors(input: unknown, max = 6): string {
  if (input == null) return "";
  if (typeof input === "string") {
    return input.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, max).join(", ");
  }
  if (Array.isArray(input)) {
    const names = input
      .map((a) => {
        if (typeof a === "string") return a.trim();
        if (a && typeof a === "object") {
          const o = a as Record<string, unknown>;
          if (typeof o.name === "string") return o.name.trim();
          const given = typeof o.given === "string" ? o.given : "";
          const family = typeof o.family === "string" ? o.family : "";
          return [given, family].filter(Boolean).join(" ").trim();
        }
        return "";
      })
      .filter(Boolean)
      .slice(0, max);
    return names.join(", ");
  }
  return "";
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  const cleaned = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "").toLowerCase();
  return cleaned || null;
}

function yearFrom(value: string | number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return null;
  const m = String(value).match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function searchOpenLiterature(query: string, rows = 12): Promise<LiteratureWork[]> {
  const q = query.trim().slice(0, 200);
  if (!q) return [];
  try {
    const data = (await fetchJson(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q + " OPEN_ACCESS:Y")}&format=json&pageSize=${Math.min(rows, 25)}`,
    )) as { resultList?: { result?: Record<string, unknown>[] } };
    const results = data.resultList?.result ?? [];
    return results.slice(0, rows).map((r, i) => {
      const title = String(r.title ?? "Untitled");
      const doi = normalizeDoi(typeof r.doi === "string" ? r.doi : null);
      return {
        id: String(r.id ?? doi ?? i),
        title: stripHtml(title),
        year: yearFrom(r.pubYear as string | number | null),
        citedBy: Number(r.citedByCount ?? 0) || 0,
        doi,
        url: doi ? `https://doi.org/${doi}` : null,
        pdfUrl: null,
        authors: formatAuthors(r.authorString),
        abstract: stripHtml(String(r.abstractText ?? "")).slice(0, 1400),
        venue: String(r.journalTitle ?? ""),
        source: "PubMed Central" as const,
        license: null,
      };
    });
  } catch {
    return [];
  }
}

export async function searchLiterature(query: string, rows = 8): Promise<LiteratureWork[]> {
  return searchOpenLiterature(query, rows);
}
