import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { getConcept, getField } from "@/lib/sciences";
import { getTeacherLessonWithAuthor, type TeacherPublicCard } from "@/lib/server/teacher-public";
import { TeacherAuthorByline } from "@/components/teacher-author-popup";
import type { Concept } from "@/lib/sciences-types";
import { generateTopicQuiz, type QuizQuestion } from "@/lib/server/quiz";
import { Button } from "@/components/ui/button";
import { videosForConcept, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/topic-videos";
import { reportTeacherContent } from "@/lib/server/messages";

export const Route = createFileRoute("/lesson/$slug/$conceptId")({
  component: LessonPage,
});

async function loadLongform(slug: string, conceptId: string) {
  try {
    const res = await fetch(`/longform/${slug}/${conceptId}.md`);
    if (!res.ok) return null;
    const body = await res.text();
    if (!body.trim()) return null;
    const words = body.trim().split(/\s+/).length;
    return { body, words };
  } catch {
    return null;
  }
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [t, lf] = await Promise.all([
        getTeacherLessonWithAuthor({ data: { fieldSlug: slug, conceptId } }).catch(() => null),
        loadLongform(slug, conceptId),
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
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, conceptId]);

  const concept = teacher ?? found?.concept ?? null;
  const field = found?.field ?? fieldOnly;

  if (!field || !concept) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-2xl flex-1 px-4 py-16">
          <p className="text-muted">Topic not found.</p>
          <Link to="/explore" className="mt-4 inline-block text-primary hover:underline">
            Back to sciences
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const teacherBody = teacher?.summary || "";
  const shortBody = concept.summary || "";
  const displayMarkdown = teacher ? teacherBody : longform || shortBody;
  const source = teacher
    ? "Teacher lesson (overrides built-in)"
    : longform
      ? `Longform lesson (~${longformWords} words)`
      : "Core outline";

  const paragraphs = displayMarkdown.split(/\n\n+/).filter(Boolean);
  const ideas = concept.keyIdeas ?? [];

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Link
          to="/fields/$slug"
          params={{ slug }}
          className="text-sm text-muted hover:text-fg"
        >
          \u2190 {field.name}
        </Link>
        <h1 className="mt-4 font-display text-4xl tracking-tight">{concept.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {concept.module} \u00b7 ~{concept.minutes ?? 25} min \u00b7 {source}
        </p>

        <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm">
          <p className="font-medium">At a glance</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>
              <strong>Topic:</strong> {concept.title} ({field.name})
            </li>
            {concept.whyItMatters ? (
              <li>
                <strong>Why it matters:</strong> {concept.whyItMatters}
              </li>
            ) : null}
            <li>
              <strong>Sources:</strong> open-access literature via the Library; teacher lessons when
              published; curated educational videos where mapped.
            </li>
          </ul>
        </div>

        {!longform && !teacher ? (
          <p className="mt-4 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted">
            Extended text not loaded. Copy longform into public folder, then refresh.
          </p>
        ) : null}

        {(() => {
          const vids = videosForConcept(slug, conceptId);
          if (!vids.length) return null;
          return (
            <section className="mt-8">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Videos</h2>
              <p className="mt-1 text-xs text-subtle">
                Open educational clips (Veritasium, The Efficient Engineer, The Organic Chemistry
                Tutor). Opens on YouTube.
              </p>
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
                    {v.note ? <p className="text-xs text-subtle">{v.note}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })()}

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
                  <h3 key={i} className="pt-3 text-lg font-semibold">
                    {p.replace(/^#+\s*/, "")}
                  </h3>
                );
              return (
                <p key={i} className="text-fg/90">
                  {p}
                </p>
              );
            })}
          </div>
        </article>

        {!teacher && ideas.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-sm font-semibold">Key ideas</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {ideas.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {teacherAuthor ? (
          <TeacherAuthorByline
            author={teacherAuthor}
            fieldSlug={slug}
            conceptId={conceptId}
          />
        ) : null}

        {teacher ? (
          <section className="mt-10 rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">Report teacher content</h2>
            <p className="mt-1 text-xs text-muted">
              If this teacher lesson has wrong or unsafe claims, send an alert to moderators.
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
          <h2 className="text-lg font-semibold">Quiz \u00b7 this subtopic</h2>
          <p className="mt-1 text-sm text-muted">
            Questions are built from this topic\u2019s key ideas in {field.name}. Check your understanding
            when you finish the lesson.
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
                              (show
                                ? correct
                                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                                  : selected
                                    ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                                    : "border-border opacity-70"
                                : "border-border hover:bg-bg")
                            }
                            onClick={() =>
                              setPicked((prev) => ({ ...prev, [q.id]: i }))
                            }
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

        {!loaded ? <p className="mt-6 text-xs text-subtle">Loading lesson text\u2026</p> : null}
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
