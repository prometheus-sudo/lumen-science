import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { PaperCard } from "@/components/paper-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OA_POLICY, OA_SOURCES } from "@/lib/oa-sources";
import { searchPapers } from "@/lib/server/papers";
import type { LiteratureWork } from "@/lib/literature";

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { q: initialQ } = Route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const [query, setQuery] = useState(initialQ ?? "");
  const [works, setWorks] = useState<LiteratureWork[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    setBusy(true);
    setError(null);
    setSearched(true);
    try {
      const results = await searchPapers({ data: { query: trimmed } });
      setWorks(results);
      void navigate({ search: { q: trimmed }, replace: true });
    } catch {
      setError("Search failed. Try again in a moment.");
      setWorks([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Open library</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">{OA_POLICY}</p>

        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(query);
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search open-access papers…"
            className="flex-1"
            aria-label="Search open-access literature"
          />
          <Button type="submit" disabled={busy || query.trim().length < 2}>
            {busy ? "Searching…" : "Search"}
          </Button>
        </form>

        <section className="mt-8">
          <h2 className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
            Sources we query
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {OA_SOURCES.map((s) => (
              <li key={s.id} className="rounded-md border border-border/60 px-3 py-2 text-sm">
                <span className="font-medium text-fg">{s.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{s.what}</span>
              </li>
            ))}
          </ul>
        </section>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {searched ? (
          <section className="mt-10">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
              Results {works.length ? `(${works.length})` : ""}
            </h2>
            {works.length === 0 && !busy ? (
              <p className="mt-4 text-sm text-muted">No open-access records matched that query.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {works.map((w) => (
                  <PaperCard key={w.id} work={w} />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
