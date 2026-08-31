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

const UA = "Lumen Science Academy (mailto:lumen@grok.me)";
const TIMEOUT_MS = 8000;

/** Normalize any authors field from APIs into a display string. */
function formatAuthors(input: unknown, max = 6): string {
  if (input == null) return "";
  if (typeof input === "string") {
    return input
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, max)
      .join(", ");
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

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  const cleaned = doi
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .toLowerCase();
  return cleaned || null;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 160);
}

function yearFrom(value: string | number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return null;
  const m = String(value).match(/(1[89]\d{2}|20\d{2}|21\d{2})/);
  return m ? Number(m[1]) : null;
}

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function xmlTag(block: string, name: string): string {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
  const m = block.match(re);
  return m ? decodeXml(m[1]) : "";
}

async function searchArxiv(query: string, rows: number): Promise<LiteratureWork[]> {
  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("search_query", `all:${query}`);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(rows));
  url.searchParams.set("sortBy", "relevance");
  const xml = await getText(url.toString());
  if (!xml) return [];
  const out: LiteratureWork[] = [];
  for (const raw of xml.split("<entry>").slice(1)) {
    const title = xmlTag(raw, "title");
    if (!title) continue;
    const id = xmlTag(raw, "id");
    const absId = id.replace(/^https?:\/\/arxiv\.org\/abs\//i, "").replace(/v\d+$/, "");
    const doi = normalizeDoi(xmlTag(raw, "arxiv:doi"));
    const authors = [...raw.matchAll(/<name>([^<]+)<\/name>/g)]
      .map((m) => decodeXml(m[1]))
      .slice(0, 6)
      .join(", ");
    out.push({
      id: doi ?? `arxiv:${absId || title.slice(0, 60)}`,
      title,
      year: yearFrom(xmlTag(raw, "published")),
      citedBy: 0,
      doi,
      url: absId ? `https://arxiv.org/abs/${absId}` : id || null,
      pdfUrl: absId ? `https://arxiv.org/pdf/${absId}` : null,
      authors,
      abstract: xmlTag(raw, "summary").slice(0, 1400),
      venue: "arXiv",
      source: "arXiv",
      license: "arXiv non-exclusive distribution",
    });
  }
  return out;
}

type EpmcResult = {
  id?: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  abstractText?: string;
  hasPDF?: string;
  citedByCount?: number;
};

function mapEpmc(r: EpmcResult, source: LiteratureSource): LiteratureWork | null {
  const title = stripHtml(r.title ?? "").trim();
  if (!title) return null;
  const pmcid = r.pmcid?.replace(/^PMC/i, "");
  const doi = normalizeDoi(r.doi);
  const pdfUrl =
    r.hasPDF === "Y" && pmcid
      ? `https://europepmc.org/articles/PMC${pmcid}?pdf=render`
      : null;
  const url = pmcid
    ? `https://europepmc.org/article/PMC/PMC${pmcid}`
    : r.pmid
      ? `https://europepmc.org/article/MED/${r.pmid}`
      : doi
        ? `https://doi.org/${doi}`
        : null;
  return {
    id: doi ?? r.pmcid ?? r.pmid ?? r.id ?? title.slice(0, 80),
    title,
    year: yearFrom(r.pubYear),
    citedBy: r.citedByCount ?? 0,
    doi,
    url,
    pdfUrl,
    authors: formatAuthors(r.authorString),
    abstract: stripHtml(r.abstractText ?? "").slice(0, 1400),
    venue: r.journalTitle ?? (source === "Preprint" ? "Preprint" : "Europe PMC"),
    source,
    license: source === "PubMed Central" ? "Open access (PMC)" : "Preprint",
  };
}

async function searchEuropePmc(
  query: string,
  rows: number,
  extra: string,
  source: LiteratureSource,
): Promise<LiteratureWork[]> {
  const q = extra ? `(${query}) AND ${extra}` : query;
  const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
  url.searchParams.set("query", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("resultType", "core");
  url.searchParams.set("pageSize", String(rows));
  url.searchParams.set("sort", "CITED desc");
  const body = (await getJson(url.toString())) as {
    resultList?: { result?: EpmcResult[] };
  } | null;
  return (body?.resultList?.result ?? [])
    .map((r) => mapEpmc(r, source))
    .filter((w): w is LiteratureWork => w !== null);
}

async function searchDoaj(query: string, rows: number): Promise<LiteratureWork[]> {
  const url = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=${rows}`;
  const body = (await getJson(url)) as {
    results?: {
      id?: string;
      bibjson?: {
        title?: string;
        year?: string | number;
        abstract?: string;
        author?: { name?: string }[] | string;
        journal?: { title?: string };
        identifier?: { id?: string; type?: string }[];
        link?: { url?: string; type?: string }[];
      };
    }[];
  } | null;
  const out: LiteratureWork[] = [];
  for (const item of body?.results ?? []) {
    const b = item.bibjson;
    const title = (b?.title ?? "").trim();
    if (!title) continue;
    const doi = normalizeDoi(b?.identifier?.find((i) => i.type === "doi")?.id) ?? null;
    const fulltext = b?.link?.find((l) => l.type === "fulltext")?.url ?? b?.link?.[0]?.url ?? null;
    out.push({
      id: doi ?? item.id ?? title.slice(0, 80),
      title,
      year: yearFrom(b?.year),
      citedBy: 0,
      doi,
      url: fulltext ?? (doi ? `https://doi.org/${doi}` : null),
      pdfUrl: fulltext && /\.pdf($|\?)/i.test(fulltext) ? fulltext : null,
      authors: formatAuthors(b?.author),
      abstract: stripHtml(b?.abstract ?? "").slice(0, 1400),
      venue: b?.journal?.title ?? "DOAJ",
      source: "DOAJ",
      license: "Open access (DOAJ)",
    });
  }
  return out;
}

async function searchPlos(query: string, rows: number): Promise<LiteratureWork[]> {
  const url = new URL("https://api.plos.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("wt", "json");
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("fl", "id,title,author,abstract,publication_date,journal,counter_total_all");
  const body = (await getJson(url.toString())) as {
    response?: {
      docs?: {
        id?: string;
        title?: string;
        author?: string[] | string;
        abstract?: string[] | string;
        publication_date?: string;
        journal?: string;
        counter_total_all?: number;
      }[];
    };
  } | null;
  const out: LiteratureWork[] = [];
  for (const d of body?.response?.docs ?? []) {
    const title = (d.title ?? "").trim();
    if (!title) continue;
    const doi = normalizeDoi(d.id);
    const abstractRaw = d.abstract;
    const abstract = Array.isArray(abstractRaw)
      ? stripHtml(abstractRaw.join(" ")).slice(0, 1400)
      : stripHtml(String(abstractRaw ?? "")).slice(0, 1400);
    out.push({
      id: doi ?? title.slice(0, 80),
      title,
      year: yearFrom(d.publication_date),
      citedBy: d.counter_total_all ?? 0,
      doi,
      url: doi ? `https://doi.org/${doi}` : null,
      pdfUrl: doi ? `https://doi.org/${doi}` : null,
      authors: formatAuthors(d.author),
      abstract,
      venue: d.journal ?? "PLOS",
      source: "PLOS",
      license: "CC BY",
    });
  }
  return out;
}

async function searchZenodo(query: string, rows: number): Promise<LiteratureWork[]> {
  const url = new URL("https://zenodo.org/api/records");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "publication");
  url.searchParams.set("access_status", "open");
  url.searchParams.set("size", String(rows));
  const body = (await getJson(url.toString())) as {
    hits?: {
      hits?: {
        id?: number;
        doi?: string;
        links?: { html?: string };
        files?: { key?: string; links?: { self?: string } }[];
        metadata?: {
          title?: string;
          publication_date?: string;
          description?: string;
          journal?: { title?: string };
          creators?: { name?: string }[];
          license?: { id?: string };
        };
      }[];
    };
  } | null;
  const out: LiteratureWork[] = [];
  for (const hit of body?.hits?.hits ?? []) {
    const title = (hit.metadata?.title ?? "").trim();
    if (!title) continue;
    const doi = normalizeDoi(hit.doi);
    const pdf = hit.files?.find((f) => /\.pdf$/i.test(f.key ?? ""))?.links?.self ?? null;
    out.push({
      id: doi ?? `zenodo:${hit.id ?? title.slice(0, 60)}`,
      title,
      year: yearFrom(hit.metadata?.publication_date),
      citedBy: 0,
      doi,
      url: hit.links?.html ?? (doi ? `https://doi.org/${doi}` : null),
      pdfUrl: pdf,
      authors: formatAuthors(hit.metadata?.creators),
      abstract: stripHtml(hit.metadata?.description ?? "").slice(0, 1400),
      venue: hit.metadata?.journal?.title ?? "Zenodo",
      source: "Zenodo",
      license: hit.metadata?.license?.id ?? "Open (Zenodo)",
    });
  }
  return out;
}

type CrossrefWork = {
  DOI?: string;
  title?: string[];
  author?: { given?: string; family?: string }[];
  issued?: { "date-parts"?: number[][] };
  "is-referenced-by-count"?: number;
  URL?: string;
  abstract?: string;
  "container-title"?: string[];
  license?: { URL?: string }[];
  link?: { URL?: string; "content-type"?: string }[];
};

async function searchCrossrefCc(query: string, rows: number): Promise<LiteratureWork[]> {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query", query);
  url.searchParams.set("filter", "license.url:creativecommons.org,type:journal-article");
  url.searchParams.set("sort", "is-referenced-by-count");
  url.searchParams.set("order", "desc");
  url.searchParams.set("rows", String(rows));
  url.searchParams.set(
    "select",
    "DOI,title,author,issued,is-referenced-by-count,URL,abstract,container-title,license,link",
  );
  const body = (await getJson(url.toString())) as { message?: { items?: CrossrefWork[] } } | null;
  const out: LiteratureWork[] = [];
  for (const w of body?.message?.items ?? []) {
    const title = (w.title?.[0] ?? "").trim();
    if (!title) continue;
    const licenseUrl = (w.license ?? []).map((l) => l.URL ?? "").join(" ").toLowerCase();
    if (
      !licenseUrl.includes("creativecommons") &&
      !licenseUrl.includes("cc0") &&
      !licenseUrl.includes("publicdomain")
    ) {
      continue;
    }
    const doi = normalizeDoi(w.DOI);
    const pdf = w.link?.find((l) => (l["content-type"] ?? "").includes("pdf"))?.URL ?? null;
    out.push({
      id: doi ?? title.slice(0, 80),
      title,
      year: w.issued?.["date-parts"]?.[0]?.[0] ?? null,
      citedBy: w["is-referenced-by-count"] ?? 0,
      doi,
      url: doi ? `https://doi.org/${doi}` : (w.URL ?? null),
      pdfUrl: pdf,
      authors: formatAuthors(w.author),
      abstract: stripHtml(w.abstract ?? "").slice(0, 1400),
      venue: w["container-title"]?.[0] ?? "",
      source: "Crossref (CC)",
      license: licenseUrl.includes("cc0") ? "CC0" : "CC BY",
    });
  }
  return out;
}

function mergeWorks(groups: LiteratureWork[][], limit: number): LiteratureWork[] {
  const byKey = new Map<string, LiteratureWork>();
  for (const group of groups) {
    for (const work of group) {
      const key = work.doi ? `doi:${work.doi}` : `t:${normalizeTitle(work.title)}`;
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, work);
        continue;
      }
      byKey.set(key, {
        ...prev,
        citedBy: Math.max(work.citedBy, prev.citedBy),
        pdfUrl: prev.pdfUrl ?? work.pdfUrl,
        abstract: prev.abstract || work.abstract,
        doi: prev.doi ?? work.doi,
      });
    }
  }
  return [...byKey.values()]
    .sort((a, b) => {
      if (Boolean(a.pdfUrl) !== Boolean(b.pdfUrl)) return a.pdfUrl ? -1 : 1;
      if (b.citedBy !== a.citedBy) return b.citedBy - a.citedBy;
      return (b.year ?? 0) - (a.year ?? 0);
    })
    .slice(0, limit);
}

export async function searchOpenLiterature(query: string, rows = 12): Promise<LiteratureWork[]> {
  const q = query.trim().slice(0, 200);
  if (!q) return [];
  const per = Math.min(8, Math.max(4, rows));
  const settled = await Promise.allSettled([
    searchEuropePmc(q, per, "OPEN_ACCESS:Y", "PubMed Central"),
    searchEuropePmc(q, Math.min(5, per), "SRC:PPR", "Preprint"),
    searchArxiv(q, per),
    searchDoaj(q, per),
    searchPlos(q, per),
    searchZenodo(q, Math.min(5, per)),
    searchCrossrefCc(q, per),
  ]);
  const groups = settled.map((s) => (s.status === "fulfilled" ? s.value : []));
  return mergeWorks(groups, rows);
}

/** @deprecated use searchOpenLiterature */
export async function searchLiterature(query: string, rows = 8): Promise<LiteratureWork[]> {
  return searchOpenLiterature(query, rows);
}
