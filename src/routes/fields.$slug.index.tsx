import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { FieldGlyph } from "@/components/field-glyph";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { conceptsByModule, getField } from "@/lib/sciences";
import type { Concept } from "@/lib/sciences-types";
import { listPublishedTeacherLessons } from "@/lib/server/teacher-lessons";
import { fetchFieldPapers } from "@/lib/server/papers";
import type { LiteratureWork } from "@/lib/literature";
import { authorsToString } from "@/lib/authors-display";

export const Route = createFileRoute("/fields/$slug/")({
  component: FieldPage,
});

function FieldPage() {
  const { slug } = Route.useParams();
  const field = getField(slug);
  const [papers, setPapers] = useState<LiteratureWork[] | null>(null);
  const [teacherConcepts, setTeacherConcepts] = useState<Concept[]>([]);

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
    listPublishedTeacherLessons({ data: { fieldSlug: field.slug } })
      .then((rows) => {
        if (!cancelled) setTeacherConcepts(rows);
      })
      .catch(() => {
        if (!cancelled) setTeacherConcepts([]);
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

  const mergedField = {
    ...field,
    concepts: [
      ...field.concepts,
      ...teacherConcepts.filter((tc) => !field.concepts.some((c) => c.id === tc.id)),
    ],
  };
  const modules = conceptsByModule(mergedField);

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
          <h2 className="font-display text-2xl tracking-tight">Lessons</h2>
          <p className="mt-1 text-sm text-muted">
            Open a topic for the full lesson. Teachers can add new subtopics from{" "}
            <Link to="/teach" className="text-primary hover:underline">
              Teach
            </Link>
            .
          </p>
          <div className="mt-6 space-y-10">
            {modules.map(({ module, concepts }) => (
              <div key={module}>
                <h3 className="text-xs font-medium tracking-[0.16em] text-muted uppercase">{module}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {concepts.map((c) => (
                    <Link
                      key={c.id}
                      to="/lesson/$slug/$conceptId"
                      params={{ slug: field.slug, conceptId: c.id }}
                      className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-fg/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium leading-snug group-hover:underline">{c.title}</span>
                        <BookOpen className="size-4 shrink-0 text-muted" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{c.summary}</p>
                      <p className="mt-2 text-xs text-subtle">{c.minutes ?? 25} min</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {field.landmarks?.length ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl tracking-tight">Landmark ideas</h2>
            <ul className="mt-5 space-y-4">
              {field.landmarks.map((p) => (
                <li key={p.title} className="rounded-lg border border-border bg-surface p-4">
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {typeof p.authors === "string" ? p.authors : authorsToString(p.authors)} ·{" "}
                    {p.year}
                  </p>
                  <p className="mt-2 text-sm text-subtle">{p.significance}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">From the literature</h2>
          <p className="mt-1 text-sm text-muted">Open-access records for this field.</p>
          <div className="mt-5 space-y-3">
            {papers === null && (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            )}
            {papers && papers.length === 0 && (
              <Card>
                <CardContent className="text-sm text-muted">
                  Live literature could not be loaded just now.
                </CardContent>
              </Card>
            )}
            {papers?.slice(0, 8).map((w) => (
              <article key={w.id} className="rounded-lg border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {w.venue ? <Badge>{w.venue}</Badge> : null}
                  {w.year ? <span className="text-xs tabular-nums text-subtle">{w.year}</span> : null}
                </div>
                <h3 className="mt-2 font-medium leading-snug">{w.title}</h3>
                <p className="mt-1 text-sm text-muted">{authorsToString(w.authors)}</p>
                {w.url ? (
                  <a
                    href={w.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                  >
                    Open record
                    <ArrowUpRight className="size-3.5" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
