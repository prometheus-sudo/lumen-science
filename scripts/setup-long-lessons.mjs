#!/usr/bin/env node
/**
 * One-shot Windows-safe setup: lesson page + longform loader + generate long texts.
 * Run: node scripts/setup-long-lessons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function write(rel, content) {
  const dest = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
  console.log("wrote", rel, fs.statSync(dest).size, "bytes");
}

const longformTs = `import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FIELD_SLUGS } from "@/lib/sciences-types";

const ROOT = path.join(process.cwd(), "src/lib/curriculum/longform");

function safeSegment(s: string) {
  return /^[a-z0-9_-]+$/i.test(s);
}

export const getLongformLesson = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { fieldSlug?: string; conceptId?: string };
    if (!d?.fieldSlug || !d?.conceptId) throw new Error("fieldSlug and conceptId required");
    if (!FIELD_SLUGS.includes(d.fieldSlug as (typeof FIELD_SLUGS)[number])) {
      throw new Error("Unknown field");
    }
    if (!safeSegment(d.fieldSlug) || !safeSegment(d.conceptId)) {
      throw new Error("Invalid id");
    }
    return { fieldSlug: d.fieldSlug, conceptId: d.conceptId };
  })
  .handler(async ({ data }) => {
    const file = path.join(ROOT, data.fieldSlug, \"${data.conceptId}.md\");
    try {
      const body = await readFile(file, "utf8");
      const words = body.trim().split(/\\s+/).filter(Boolean).length;
      return { ok: true as const, body, words };
    } catch {
      return { ok: false as const, body: null as string | null, words: 0 };
    }
  });
`;

const lessonTsx = `import { createFileRoute, Link } from "@tanstack/react-router";
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

  const teacherBody = teacher?.summary || "";
  const shortBody = concept.summary || concept.whyItMatters || "";
  const displayMarkdown = teacher ? teacherBody : longform || shortBody;
  const source = teacher
    ? "Teacher lesson (overrides built-in)"
    : longform
      ? "Extended lesson \\u00b7 ~" + longformWords.toLocaleString() + " words"
      : "Core summary only \u2014 longform file missing";
  const ideas = concept.keyIdeas ?? [];
  const paragraphs = displayMarkdown.split(/\\n\\n+/).filter(Boolean);

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link to="/fields/$slug" params={{ slug: field.slug }} className="text-sm text-muted hover:text-fg">
          \u2190 {field.name}
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wide text-subtle">
          {concept.module || "Lesson"}
          {concept.minutes ? " \\u00b7 ~" + concept.minutes + " min core" : ""}
          {" \\u00b7 "}
          {source}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{concept.title}</h1>
        <p className="mt-3 text-base text-muted">{concept.whyItMatters}</p>
        {!longform && !teacher ? (
          <p className="mt-4 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted">
            Extended text not found. Run node scripts/setup-long-lessons.mjs then refresh.
          </p>
        ) : null}
        <article className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Full lesson</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed">
            {paragraphs.map((p, i) => {
              if (p.startsWith("# "))
                return (
                  <h2 key={i} className="pt-4 font-display text-2xl tracking-tight">
                    {p.replace(/^#+\\s*/, "")}
                  </h2>
                );
              if (p.startsWith("## "))
                return (
                  <h3 key={i} className="pt-6 font-display text-xl tracking-tight">
                    {p.replace(/^#+\\s*/, "")}
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
`;

write("src/lib/server/longform.ts", longformTs);
write(path.join("src", "routes", "lesson.$slug.$conceptId.tsx"), lessonTsx);

const genPath = path.join(ROOT, "scripts", "generate-longform.mjs");
if (!fs.existsSync(genPath)) {
  console.error("Missing scripts/generate-longform.mjs");
  console.error("Run: curl -L -o scripts\\generate-longform.mjs https://raw.githubusercontent.com/prometheus-sudo/lumen-science/main/scripts/generate-longform.mjs");
  process.exit(1);
}

console.log("Generating longform markdown...");
const r = spawnSync(process.execPath, [genPath], { cwd: ROOT, stdio: "inherit" });
if (r.status !== 0) process.exit(r.status || 1);

const sample = path.join(ROOT, "src", "lib", "curriculum", "longform", "ecology", "eco-food.md");
if (fs.existsSync(sample)) {
  const words = fs.readFileSync(sample, "utf8").trim().split(/\s+/).length;
  console.log("OK sample ecology/eco-food.md words:", words);
} else {
  console.warn("WARNING: sample missing", sample);
}

console.log("Done. Restart Vite, open http://localhost:8080/lesson/ecology/eco-food");
