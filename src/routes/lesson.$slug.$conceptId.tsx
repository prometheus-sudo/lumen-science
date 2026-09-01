import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { getConcept, getField } from "@/lib/sciences";
import { getLongformLesson } from "@/lib/server/longform";
import { getTeacherLesson } from "@/lib/server/teacher-lessons";
import type { Concept } from "@/lib/sciences-types";

export const Route = createFileRoute("/lesson/$slug/$conceptId")({
  component: LessonPage,
});

function LessonPage() {
  const { slug, conceptId } = Route.useParams();
  const found = getConcept(slug, conceptId);
  const fieldOnly = getField(slug);
  const [teacher, setTeacher] = useState<Concept | null>(null);
  const [longform, setLongform] = useState<string | null>(null);
  const [longformWords, setLongformWords] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTeacherLesson({ data: { fieldSlug: slug, conceptId } }).catch(() => null),
      getLongformLesson({ data: { fieldSlug: slug, conceptId } }).catch(() => ({
        ok: false as const,
        body: null as string | null,
        words: 0,
      })),
    ]).then(([t, lf]) => {
      if (cancelled) return;
      setTeacher(t);
      if (lf && "ok" in lf && lf.ok && lf.body) {
        setLongform(lf.body);
        setLongformWords(lf.words);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, conceptId]);

  const concept = teacher ?? found?.concept ?? null;
  const field = found?.field ?? fieldOnly;

  if (!loaded) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center text-muted">Loading lesson…</main>
      </div>
    );
  }

  if (!concept || !field) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Lesson not found</h1>
          <p className="mt-4 text-sm text-muted">
            Looking for <strong>{conceptId}</strong> in <strong>{slug}</strong>
          </p>
          <Link to="/explore" className="mt-6 inline-block text-sm text-primary">
            Back to sciences
          </Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  const teacherBody = teacher?.summary || "";
  const shortBody = concept.summary || concept.whyItMatters || "";
  const displayMarkdown = teacher ? teacherBody : longform || shortBody;
  const source = teacher
    ? "Teacher lesson (overrides built-in)"
    : longform
      ? `Extended lesson · ~${longformWords.toLocaleString()} words`
      : "Core summary (run node scripts/generate-longform.mjs for full text)";
  const ideas = concept.keyIdeas ?? [];
  const paragraphs = displayMarkdown.split(/\n\n+/).filter(Boolean);

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          to="/fields/$slug"
          params={{ slug: field.slug }}
          className="text-sm text-muted hover:text-fg"
        >
          ← {field.name}
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wide text-subtle">
          {concept.module || "Lesson"}
          {concept.minutes ? ` · ~${concept.minutes} min core` : ""}
          {" · "}
          {source}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{concept.title}</h1>
        <p className="mt-3 text-base text-muted">{concept.whyItMatters}</p>

        {!longform && !teacher ? (
          <p className="mt-4 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted">
            Full extended text is not on disk yet. In a terminal run:{" "}
            <code className="text-fg">node scripts/generate-longform.mjs</code>, then refresh this
            page.
          </p>
        ) : null}

        <article className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Full lesson</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed">
            {paragraphs.map((p, i) => {
              if (p.startsWith("# ")) {
                return (
                  <h2 key={i} className="pt-4 font-display text-2xl tracking-tight">
                    {p.replace(/^#+\s*/, "")}
                  </h2>
                );
              }
              if (p.startsWith("## ")) {
                return (
                  <h3 key={i} className="pt-6 font-display text-xl tracking-tight">
                    {p.replace(/^#+\s*/, "")}
                  </h3>
                );
              }
              if (p === "---") return null;
              return (
                <p key={i} className="whitespace-pre-wrap">
                  {p}
                </p>
              );
            })}
          </div>
        </article>

        {!teacher && ideas.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
              Key ideas (quick revision)
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {ideas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-12 text-sm text-muted">
          Teachers can replace this text from{" "}
          <Link to="/teach" className="underline">
            Teach
          </Link>{" "}
          by publishing a lesson with the same field and concept id.
        </p>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
