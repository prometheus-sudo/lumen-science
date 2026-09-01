import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { getConcept, getField } from "@/lib/sciences";
import { getTeacherLesson } from "@/lib/server/teacher-lessons";
import type { Concept } from "@/lib/sciences-types";

export const Route = createFileRoute("/lesson/$slug/$conceptId")({
  component: LessonPage,
});

async function loadLongform(slug: string, conceptId: string) {
  try {
    const res = await fetch(`/longform/${slug}/${conceptId}.md`, { cache: "no-store" });
    if (res.ok) {
      const body = await res.text();
      if (body && !body.trimStart().startsWith("<!")) {
        const words = body.trim().split(/\s+/).filter(Boolean).length;
        if (words > 50) return { body, words };
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

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
    (async () => {
      const [t, lf] = await Promise.all([
        getTeacherLesson({ data: { fieldSlug: slug, conceptId } }).catch(() => null),
        loadLongform(slug, conceptId),
      ]);
      if (cancelled) return;
      setTeacher(t);
      if (lf) {
        setLongform(lf.body);
        setLongformWords(lf.words);
      }
      setLoaded(true);
    })();
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
      : "Core summary only — longform not loaded";
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
            Extended text not loaded. Run{" "}
            <code className="text-fg">node scripts/publish-longform.mjs</code> then refresh.
          </p>
        ) : null}

        <article className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Full lesson</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed">
            {paragraphs.map((p, i) => {
              if (p.startsWith("# "))
                return (
                  <h2 key={i} className="pt-4 font-display text-2xl tracking-tight">
                    {p.replace(/^#+\s*/, "")}
                  </h2>
                );
              if (p.startsWith("## "))
                return (
                  <h3 key={i} className="pt-6 font-display text-xl tracking-tight">
                    {p.replace(/^#+\s*/, "")}
                  </h3>
                );
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
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Key ideas</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {ideas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
