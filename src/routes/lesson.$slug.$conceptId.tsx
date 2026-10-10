import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { getConcept, getField } from "@/lib/sciences";
import { getTeacherLessonWithAuthor, type TeacherPublicCard } from "@/lib/server/teacher-public";
import { TeacherAuthorByline } from "@/components/teacher-author-popup";
import type { Concept } from "@/lib/sciences-types";
import { generateTopicQuiz, type QuizQuestion } from "@/lib/server/quiz";
import { Button } from "@/components/ui/button";
import { videosForConcept, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/topic-videos";
import { reportTeacherContent } from "@/lib/server/messages";
import { fetchConceptPapers } from "@/lib/server/papers";
import type { LiteratureWork } from "@/lib/literature";
import { authorsToString } from "@/lib/authors-display";
import {
  buildGlossary,
  LessonGlossary,
  LessonWikiBody,
} from "@/components/lesson-wiki";

function stripLessonMeta(md: string): string {
  return md
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (/^\*\*Field:\*\*/i.test(t)) return false;
      if (/^\*\*Module:\*\*/i.test(t)) return false;
      if (/^\*\*Concept id:\*\*/i.test(t)) return false;
      if (/^\*\*Target depth:\*\*/i.test(t)) return false;
      if (/^\*\*Override:\*\*/i.test(t)) return false;
      if (/\*\*Field:\*\*.*\*\*Module:\*\*.*\*\*Concept id:\*\*/i.test(t)) return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

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
  const [teacherAuthor, setTeacherAuthor] = useState<TeacherPublicCard | null>(null);
  const [longform, setLongform] = useState<string | null>(null);
  const [longformWords, setLongformWords] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [quiz, setQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [citations, setCitations] = useState<LiteratureWork[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [t, lf, papers] = await Promise.all([
        getTeacherLessonWithAuthor({ data: { fieldSlug: slug, conceptId } }).catch(() => null),
        loadLongform(slug, conceptId),
        fetchConceptPapers({ data: { slug, conceptId } }).catch(() => [] as LiteratureWork[]),
      ]);
      if (cancelled) return;
      if (t) {
        setTeacher(t.concept);
        setTeacherAuthor(t.author);
      } else {
        setTeacher(null);
        setTeacherAuthor(null);
      }
      if (lf) {
        setLongform(lf.body);
        setLongformWords(lf.words);
      }
      setCitations(papers.slice(0, 10));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, conceptId]);

  const concept = teacher ?? found?.concept ?? null;
  const field = found?.field ?? fieldOnly;

  const teacherBody = teacher?.summary || "";
  const shortBody = concept?.summary || concept?.whyItMatters || "";
  const displayMarkdown = stripLessonMeta(teacher ? teacherBody : longform || shortBody || "");

  const glossary = useMemo(
    () => buildGlossary(displayMarkdown, concept?.keyIdeas ?? []),
    [displayMarkdown, concept?.keyIdeas],
  );

  if (!loaded) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center text-muted">Loading lesson\u2026</main>
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

  const landmarks = field.landmarks?.slice(0, 5) ?? [];

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          to="/fields/$slug"
          params={{ slug: field.slug }}
          className="text-sm text-muted hover:text-fg"
        >
          \u2190 {field.name}
        </Link>

        <header className="mt-4 border-b border-border pb-6">
          <h1 className="font-display text-4xl tracking-tight">{concept.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">{concept.whyItMatters}</p>
          <p className="mt-3 text-xs text-subtle">
            From Lumen \u00b7 {field.name}
            {longformWords > 0 ? ` \u00b7 ~${longformWords.toLocaleString()} words` : ""}
            {teacherAuthor?.username ? " \u00b7 with contributions" : ""}
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-border bg-surface p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">At a glance</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg">
            <li>
              <strong>Topic:</strong> {concept.title}
            </li>
            {concept.whyItMatters ? (
              <li>
                <strong>Why it matters:</strong> {concept.whyItMatters}
              </li>
            ) : null}
            <li>
              <strong>Sources:</strong> open-access literature and curriculum summaries.
            </li>
          </ul>
        </section>

        {(() => {
          const vids = videosForConcept(slug, conceptId);
          if (!vids.length) return null;
          return (
            <section className="mt-8">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Videos</h2>
              <ul className="mt-4 space-y-6">
                {vids.map((v) => (
                  <li key={v.youtubeId} className="rounded-lg border border-border bg-surface p-3">
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-black/5">
                      <iframe
                        title={v.title}
                        src={youtubeEmbedUrl(v.youtubeId)}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <a
                      href={youtubeWatchUrl(v.youtubeId)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      {v.title}
                    </a>
                    <span className="text-xs text-muted"> \u00b7 {v.channel}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })()}

        <article className="mt-10">
          <LessonWikiBody markdown={displayMarkdown} glossary={glossary} />
        </article>

        <LessonGlossary entries={glossary} />

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl tracking-tight">Contributors</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-md border border-border bg-surface px-3 py-2">
              <p className="font-medium">Lumen curriculum</p>
              <p className="text-xs text-muted">
                Base lesson assembled from established open science and standard curricula for{" "}
                {field.name}.
              </p>
            </li>
            {teacherAuthor ? (
              <li className="rounded-md border border-border bg-surface px-3 py-2">
                <TeacherAuthorByline
                  author={teacherAuthor}
                  fieldSlug={slug}
                  conceptId={conceptId}
                />
                <p className="mt-1 text-xs text-muted">
                  Teacher contribution integrated after automated fact-check (where applicable).
                </p>
              </li>
            ) : null}
          </ul>
        </section>

        <section className="mt-12 border-t border-border pt-8" id="references">
          <h2 className="font-display text-xl tracking-tight">References</h2>
          <p className="mt-1 text-xs text-muted">
            Open-access records and landmark ideas related to this topic. Links open externally.
          </p>

          {landmarks.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
                Landmark ideas
              </h3>
              <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">
                {landmarks.map((p) => (
                  <li key={p.title}>
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted">
                      {" "}\u2014{" "}
                      {typeof p.authors === "string"
                        ? p.authors
                        : authorsToString(p.authors)}{" "}
                      ({p.year})
                    </span>
                    {p.significance ? (
                      <p className="mt-0.5 text-xs text-subtle">{p.significance}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="mt-6">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              Open literature
            </h3>
            {citations.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No open-access records were retrieved for this topic just now. Try the Library.
              </p>
            ) : (
              <ol className="mt-3 list-decimal space-y-4 pl-5 text-sm">
                {citations.map((w) => (
                  <li key={w.id}>
                    <span className="font-medium leading-snug">{w.title}</span>
                    <p className="text-xs text-muted">
                      {authorsToString(w.authors)}
                      {w.year ? ` (${w.year})` : ""}
                      {w.venue ? ` \u00b7 ${w.venue}` : ""}
                      {w.source ? ` \u00b7 ${w.source}` : ""}
                      {w.doi ? ` \u00b7 doi:${w.doi}` : ""}
                    </p>
                    {w.url ? (
                      <a
                        href={w.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open record
                      </a>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {teacher ? (
          <section className="mt-10 rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">Report content</h2>
            <p className="mt-1 text-xs text-muted">
              If this lesson has wrong or unsafe claims, send an alert.
            </p>
            <Button
              className="mt-3"
              variant="secondary"
              type="button"
              onClick={() => {
                const reason = window.prompt(
                  "Describe what is wrong (facts, missing context, unsafe advice):",
                );
                if (!reason || reason.trim().length < 10) return;
                reportTeacherContent({
                  data: { fieldSlug: slug, conceptId, reason },
                })
                  .then(() => window.alert("Report received. Thank you."))
                  .catch((err) =>
                    window.alert(err instanceof Error ? err.message : "Could not send report"),
                  );
              }}
            >
              Report incorrect data
            </Button>
          </section>
        ) : null}

        <section className="mt-12 border-t border-border pt-10" id="topic-quiz">
          <h2 className="text-lg font-semibold">Quiz</h2>
          <p className="mt-1 text-sm text-muted">
            Questions adapt to your level and region when you are signed in.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            disabled={quizBusy}
            onClick={() => {
              setQuizBusy(true);
              generateTopicQuiz({ data: { slug, conceptId } })
                .then((q) => {
                  setQuiz(q);
                  setPicked({});
                })
                .catch(() => setQuiz(null))
                .finally(() => setQuizBusy(false));
            }}
          >
            {quizBusy ? "Building quiz\u2026" : quiz ? "Regenerate quiz" : "Generate quiz"}
          </Button>
          {quiz && quiz.questions.length > 0 ? (
            <div className="mt-6 space-y-6">
              <p className="text-sm font-medium">{quiz.title}</p>
              {quiz.questions.map((q) => (
                <div key={q.id} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">{q.prompt}</p>
                  <ul className="mt-3 space-y-2">
                    {q.choices.map((c, i) => {
                      const selected = picked[q.id] === i;
                      const show = picked[q.id] !== undefined;
                      const correct = i === q.answerIndex;
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            className={
                              "w-full rounded-md border px-3 py-2 text-left text-sm " +
                              (show && correct
                                ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                                : show && selected
                                  ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                                  : "border-border hover:bg-surface")
                            }
                            onClick={() => setPicked((prev) => ({ ...prev, [q.id]: i }))}
                          >
                            {c}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {picked[q.id] !== undefined ? (
                    <p className="mt-2 text-xs text-muted">{q.explanation}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
