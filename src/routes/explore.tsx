import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FieldGlyph } from "@/components/field-glyph";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { FIELDS } from "@/lib/sciences";

export const Route = createFileRoute("/explore")({ component: Explore });

type TopicHit = {
  fieldSlug: string;
  fieldName: string;
  conceptId: string;
  title: string;
  module: string;
};

function Explore() {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const filteredFields = useMemo(() => {
    if (!needle) return FIELDS;
    return FIELDS.filter((f) => {
      const fieldText = [f.name, f.tagline, f.overview, ...f.subfields]
        .join(" ")
        .toLowerCase();
      if (fieldText.includes(needle)) return true;
      return f.concepts.some((c) =>
        [c.title, c.module, c.summary, ...(c.keyIdeas ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [needle]);

  const topicHits = useMemo(() => {
    if (!needle) return [] as TopicHit[];
    const hits: TopicHit[] = [];
    for (const f of FIELDS) {
      for (const c of f.concepts) {
        const blob = [c.title, c.module, c.summary, ...(c.keyIdeas ?? [])]
          .join(" ")
          .toLowerCase();
        if (blob.includes(needle)) {
          hits.push({
            fieldSlug: f.slug,
            fieldName: f.name,
            conceptId: c.id,
            title: c.title,
            module: c.module,
          });
        }
      }
    }
    return hits.slice(0, 40);
  }, [needle]);

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Catalogue</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">The sciences</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Each field is a map: core ideas, landmark papers, and live literature. Sign in to have
          lessons rewritten for your level and region, or to compile a syllabus.
        </p>
        <div className="mt-6 max-w-md">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fields, modules, and subtopics…"
            aria-label="Search sciences and subtopics"
          />
        </div>

        {needle && topicHits.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
              Matching topics ({topicHits.length}
              {topicHits.length >= 40 ? "+" : ""})
            </h2>
            <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
              {topicHits.map((t) => (
                <li key={`${t.fieldSlug}-${t.conceptId}`}>
                  <Link
                    to="/lesson/$slug/$conceptId"
                    params={{ slug: t.fieldSlug, conceptId: t.conceptId }}
                    className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-bg/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-fg">{t.title}</span>
                    <span className="text-xs text-muted">
                      {t.fieldName} · {t.module}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {needle && topicHits.length === 0 && filteredFields.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No fields or topics matched “{q.trim()}”.</p>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFields.map((field) => (
            <Link
              key={field.slug}
              to="/fields/$slug"
              params={{ slug: field.slug }}
              className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors duration-150 hover:border-primary/30"
            >
              <FieldGlyph slug={field.slug} className="size-8" />
              <h2 className="mt-4 font-display text-2xl tracking-tight">{field.name}</h2>
              <p className="mt-1 text-sm text-muted">{field.tagline}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-subtle">
                {field.overview}
              </p>
              <p className="mt-4 text-xs text-subtle">{field.concepts.length} core lessons</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
