import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { FieldGlyph } from "@/components/field-glyph";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { conceptsByModule, getField } from "@/lib/sciences";
import { fetchFieldPapers } from "@/lib/server/papers";
import type { LiteratureWork } from "@/lib/literature";

export const Route = createFileRoute("/fields/$slug/")({ component: FieldPage });

function FieldPage() {
  const { slug } = Route.useParams();
  const field = getField(slug);
  const [papers, setPapers] = useState<LiteratureWork[] | null>(null);

  useEffect(() => {
    if (!field) return;
    let cancelled = false;
    fetchFieldPapers({ data: { slug: field.slug } })
      .then((rows) => {
        if (!cancelled) setPapers(rows);
      })
      .catch(() => {
        if (!cancelled) setPapers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [field]);

  if (!field) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Field not found</h1>
          <Link to="/explore" className="mt-4 inline-block text-sm text-muted hover:text-fg">
            Back to the sciences
          </Link>
        </main>
      </div>
    );
  }

  const modules = conceptsByModule(field);

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Link to="/explore" className="text-sm text-muted hover:text-fg">
          Sciences
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <FieldGlyph slug={field.slug} className="size-12 shrink-0" />
          <div>
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{field.name}</h1>
            <p className="mt-2 text-base text-muted">{field.tagline}</p>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-fg">{field.overview}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {field.subfields.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">Curriculum</h2>
          <p className="mt-1 text-sm text-muted">
            {field.concepts.length} lessons
            {modules.length > 0 ? ` in ${modules.length} modules` : ""}. Sign in to rewrite any
            lesson for your level and region.
          </p>
          {modules.length > 0 ? (
            <div className="mt-8 space-y-12">
              {modules.map(({ module, concepts }) => (
                <div key={module}>
                  <h3 className="font-display text-xl tracking-tight">{module}</h3>
                  <p className="mt-1 text-xs text-subtle">{concepts.length} lessons</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {concepts.map((c) => (
                      <Link
                        key={c.id}
                        to="/fields/$slug/learn/$conceptId"
                        params={{ slug: field.slug, conceptId: c.id }}
                        className="rounded-lg border border-border bg-surface p-5 transition-colors duration-150 hover:border-primary/30"
                      >
                        <div className="flex items-center gap-2 text-xs font-medium text-muted">
                          <BookOpen className="size-3.5" />
                          Lesson
                          {c.minutes ? <span className="text-subtle">· ~{c.minutes} min</span> : null}
                        </div>
                        <h4 className="mt-2 font-display text-lg">{c.title}</h4>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                          {c.whyItMatters}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {field.concepts.map((c) => (
                <Link
                  key={c.id}
                  to="/fields/$slug/learn/$conceptId"
                  params={{ slug: field.slug, conceptId: c.id }}
                  className="rounded-lg border border-border bg-surface p-5 transition-colors duration-150 hover:border-primary/30"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <BookOpen className="size-3.5" />
                    Lesson
                  </div>
                  <h3 className="mt-2 font-display text-xl">{c.title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{c.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">Landmark work</h2>
          <p className="mt-1 text-sm text-muted">
            Canonical papers and books that still structure the field.
          </p>
          <ul className="mt-5 space-y-3">
            {field.landmarks.map((p) => (
              <li key={p.title} className="rounded-lg border border-border bg-surface p-4">
                <div className="font-medium">{p.title}</div>
                <div className="mt-1 text-sm text-muted">
                  {p.authors} · {p.year}
                </div>
                <p className="mt-2 text-sm text-muted">{p.significance}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 mb-8">
          <h2 className="font-display text-2xl tracking-tight">Open literature</h2>
          <p className="mt-1 text-sm text-muted">Recent open-access papers related to this field.</p>
          <div className="mt-5 grid gap-3">
            {papers === null ? (
              <Skeleton className="h-24 w-full" />
            ) : papers.length === 0 ? (
              <p className="text-sm text-muted">No papers loaded right now.</p>
            ) : (
              papers.slice(0, 8).map((w) => (
                <Card key={w.id}>
                  <CardContent className="p-4">
                    <a
                      href={w.url || w.doi || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {w.title} <ArrowUpRight className="inline size-3.5" />
                    </a>
                    <p className="mt-1 text-xs text-muted">
                      {(w.authors || []).slice(0, 3).join(", ")}
                      {w.year ? ` · ${w.year}` : ""}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
