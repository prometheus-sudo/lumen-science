import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { useEffect, useState } from "react";
import { getConcept, getField } from "@/lib/sciences";
import { getTeacherLesson } from "@/lib/server/teacher-lessons";
import type { Concept } from "@/lib/sciences-types";

export const Route = createFileRoute("/fields/$slug/learn/$conceptId")({
  component: LearnPage,
});

function LearnPage() {
  const { slug, conceptId } = Route.useParams();
  const builtIn = getConcept(slug, conceptId);
  const fieldOnly = getField(slug);
  const [teacherConcept, setTeacherConcept] = useState<Concept | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTeacherLesson({ data: { fieldSlug: slug, conceptId } })
      .then((c) => {
        if (!cancelled) setTeacherConcept(c);
      })
      .catch(() => {
        if (!cancelled) setTeacherConcept(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, conceptId]);

  const concept = teacherConcept ?? builtIn?.concept ?? null;
  const field = builtIn?.field ?? fieldOnly;
  const found = concept && field ? { field, concept } : null;

  if (!loaded && !builtIn) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center text-muted">Loading lesson…</main>
      </div>
    );
  }

  if (!found) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Lesson not found</h1>
          <p className="mt-4 text-sm text-muted">
            Looking for <strong>{conceptId}</strong> in <strong>{slug}</strong>
          </p>
          <p className="mt-2 text-xs text-subtle break-all">
            Available: {fieldOnly?.concepts?.map((c) => c.id).join(", ") || "none"}
          </p>
          <Link to="/explore" className="mt-6 inline-block text-sm text-primary">
            Back to sciences
          </Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  const ideas = concept.keyIdeas ?? [];
  const objectives = concept.objectives ?? [];
  const terms = concept.terms ?? [];
  const checks = concept.checkQuestions ?? [];
  const pitfalls = concept.pitfalls ?? [];
  const paragraphs = (concept.summary || "").split(/\n\n+/).filter(Boolean);

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link to="/fields/$slug" params={{ slug: field.slug }} className="text-sm text-muted hover:text-fg">
          ← {field.name}
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wide text-subtle">
          {concept.module || "Lesson"}
          {concept.minutes ? ` · ~${concept.minutes} min` : ""}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{concept.title}</h1>
        <p className="mt-3 text-base text-muted">{concept.whyItMatters}</p>

        {objectives.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Learning objectives</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <article className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Core lesson</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {ideas.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Key ideas (examinable)</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {ideas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {terms.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Key terms</h2>
            <dl className="mt-4 space-y-3">
              {terms.map((t) => (
                <div key={t.term} className="rounded-lg border border-border bg-surface p-3">
                  <dt className="font-medium">{t.term}</dt>
                  <dd className="mt-1 text-sm text-muted leading-relaxed">{t.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {checks.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Check yourself</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {checks.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {pitfalls.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Common pitfalls</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {pitfalls.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-12 text-sm text-muted">
          Core lessons are free. Teachers can publish longer articles from Teach. Sign in for level-adapted help.
        </p>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
