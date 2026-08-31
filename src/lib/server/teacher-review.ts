import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FIELD_SLUGS } from "@/lib/sciences-types";
import { extractJson, grokChat } from "@/lib/xai";
import { loadProfile } from "./profile";

export type FactIssue = {
  claim: string;
  severity: "error" | "warning" | "note";
  explanation: string;
  suggestion?: string;
};

export type FactCheckReport = {
  verdict: "pass" | "revise" | "fail";
  score: number;
  summary: string;
  issues: FactIssue[];
  strengths: string[];
  checkedAt: string;
};

function safeSeg(s: string) {
  return /^[a-z0-9_-]+$/i.test(s);
}

async function requireTeacher(userId: string) {
  const profile = await loadProfile(userId);
  if (profile.accountRole !== "teacher") {
    throw new Error("Teacher role required. Enable teacher mode in Account or Teach.");
  }
  return profile;
}

async function loadLongformOutline(fieldSlug: string, conceptId: string) {
  const file = path.join(
    process.cwd(),
    "src/lib/curriculum/longform",
    fieldSlug,
    `${conceptId}.md`,
  );
  try {
    const body = await readFile(file, "utf8");
    const headings = body
      .split("\n")
      .filter((l) => l.startsWith("#"))
      .slice(0, 40);
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    const head = body.slice(0, 6000);
    return { ok: true as const, words, headings, head, full: body };
  } catch {
    return { ok: false as const, words: 0, headings: [] as string[], head: "", full: "" };
  }
}

export const factCheckTeacherLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const d = input as {
      fieldSlug?: string;
      conceptId?: string;
      title?: string;
      body?: string;
    };
    if (!d?.fieldSlug || !FIELD_SLUGS.includes(d.fieldSlug as (typeof FIELD_SLUGS)[number])) {
      throw new Error("Valid field required");
    }
    if (!d.conceptId || !safeSeg(d.conceptId)) throw new Error("Valid concept id required");
    const body = (d.body || "").trim();
    if (body.length < 40) throw new Error("Paste a substantial lesson body to check");
    return {
      fieldSlug: d.fieldSlug,
      conceptId: d.conceptId.trim(),
      title: (d.title || "").trim() || "Untitled",
      body: body.slice(0, 14000),
    };
  })
  .handler(async ({ context, data }): Promise<FactCheckReport> => {
    await requireTeacher(context.userId);

    const system = `You are a rigorous scientific fact-checker for a free global science academy (Lumen).
Check the teacher-submitted lesson for factual accuracy against well-established science.

Rules:
- Do NOT invent papers, DOIs, authors, or years.
- Flag clear factual errors, impossible claims, unit mistakes, and reversed causal arrows as severity "error".
- Flag oversimplifications that mislead at school level as "warning".
- Pedagogical style notes are "note".
- Score 0-100 (100 = solid for secondary/intro university teaching).
- verdict: "pass" if score >= 75 and no errors; "revise" if warnings/errors but salvageable; "fail" if fundamental falsehoods.
- Return ONLY a JSON object with keys: verdict, score, summary, issues (array of {claim, severity, explanation, suggestion}), strengths (string array).`;

    const user = `Field: ${data.fieldSlug}
Concept id: ${data.conceptId}
Title: ${data.title}

Lesson body:
---
${data.body}
---`;

    const result = await grokChat(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { maxTokens: 2000, temperature: 0.2 },
    );

    if (!result.ok) {
      return {
        verdict: "revise",
        score: 0,
        summary: result.error,
        issues: [
          {
            claim: "(system)",
            severity: "warning",
            explanation: result.error,
            suggestion: "Try again in a moment, or shorten the body.",
          },
        ],
        strengths: [],
        checkedAt: new Date().toISOString(),
      };
    }

    let parsed: Partial<FactCheckReport> = {};
    try {
      parsed = extractJson(result.text) as Partial<FactCheckReport>;
    } catch {
      parsed = {
        verdict: "revise",
        score: 50,
        summary: result.text.slice(0, 800),
        issues: [],
        strengths: [],
      };
    }

    const issues = Array.isArray(parsed.issues)
      ? parsed.issues.filter(
          (i): i is FactIssue =>
            !!i &&
            typeof i === "object" &&
            typeof (i as FactIssue).claim === "string" &&
            typeof (i as FactIssue).explanation === "string",
        )
      : [];

    const score =
      typeof parsed.score === "number" && Number.isFinite(parsed.score)
        ? Math.max(0, Math.min(100, Math.round(parsed.score)))
        : 50;
    const verdict =
      parsed.verdict === "pass" || parsed.verdict === "fail" || parsed.verdict === "revise"
        ? parsed.verdict
        : score >= 75 && !issues.some((i) => i.severity === "error")
          ? "pass"
          : "revise";

    const report: FactCheckReport = {
      verdict,
      score,
      summary: typeof parsed.summary === "string" ? parsed.summary : "Fact check complete.",
      issues,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.filter((s): s is string => typeof s === "string")
        : [],
      checkedAt: new Date().toISOString(),
    };

    const sql = await getSql();
    await sql`
      update teacher_lessons
      set fact_check_status = ${report.verdict},
          fact_check_report = ${JSON.stringify(report)}::jsonb,
          fact_check_score = ${report.score},
          updated_at = now()
      where author_id = ${context.userId}
        and field_slug = ${data.fieldSlug}
        and concept_id = ${data.conceptId}
    `;

    return report;
  });

export const integrateTeacherWithLongform = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const d = input as {
      fieldSlug?: string;
      conceptId?: string;
      title?: string;
      body?: string;
      whyItMatters?: string;
    };
    if (!d?.fieldSlug || !FIELD_SLUGS.includes(d.fieldSlug as (typeof FIELD_SLUGS)[number])) {
      throw new Error("Valid field required");
    }
    if (!d.conceptId || !safeSeg(d.conceptId)) throw new Error("Valid concept id required");
    const body = (d.body || "").trim();
    if (body.length < 40) throw new Error("Teacher body required");
    return {
      fieldSlug: d.fieldSlug,
      conceptId: d.conceptId.trim(),
      title: (d.title || "").trim() || "Untitled",
      whyItMatters: (d.whyItMatters || "").trim(),
      body: body.slice(0, 12000),
    };
  })
  .handler(async ({ context, data }) => {
    await requireTeacher(context.userId);
    const longform = await loadLongformOutline(data.fieldSlug, data.conceptId);

    const system = `You are Lumen's lesson integration editor for a free science academy.
Merge a teacher's submitted lesson with the academy's extended AI lesson outline.

Return ONLY a JSON object:
{
  "bridge": "markdown 400-900 words that introduces the combined lesson, maps teacher emphasis to the long-form sections, and states what the teacher uniquely adds",
  "teacherCore": "markdown: cleaned, fact-aware version of the teacher's main teaching points (preserve their voice; fix only clear errors)",
  "alignmentNotes": ["short bullet mapping teacher point to longform section"],
  "warnings": ["any residual factual risks"]
}

Rules:
- Never invent citations.
- Prefer established science when the teacher conflicts with consensus; note the conflict in warnings.
- Keep teacher pedagogical examples when they are regionally useful.
- Do not reprint the entire long-form lesson in the JSON.`;

    const user = `Title: ${data.title}
Field: ${data.fieldSlug}
Concept: ${data.conceptId}
Why it matters: ${data.whyItMatters}

Teacher body:
---
${data.body}
---

Long-form lesson available: ${longform.ok ? "yes" : "no"}
Long-form word count: ${longform.words}
Headings:
${longform.headings.join("\n") || "(none)"}

Long-form opening excerpt:
---
${longform.head || "(no longform file yet)"}
---`;

    const result = await grokChat(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { maxTokens: 3500, temperature: 0.35 },
    );

    if (!result.ok) {
      throw new Error(result.error);
    }

    let bridge = "";
    let teacherCore = data.body;
    let alignmentNotes: string[] = [];
    let warnings: string[] = [];
    try {
      const parsed = extractJson(result.text) as Record<string, unknown>;
      if (typeof parsed.bridge === "string") bridge = parsed.bridge;
      if (typeof parsed.teacherCore === "string" && parsed.teacherCore.trim()) {
        teacherCore = parsed.teacherCore.trim();
      }
      if (Array.isArray(parsed.alignmentNotes)) {
        alignmentNotes = parsed.alignmentNotes.filter((x): x is string => typeof x === "string");
      }
      if (Array.isArray(parsed.warnings)) {
        warnings = parsed.warnings.filter((x): x is string => typeof x === "string");
      }
    } catch {
      bridge = result.text.slice(0, 2000);
    }

    const alignmentBlock =
      alignmentNotes.length > 0
        ? "\n\n### Alignment map (teacher to extended lesson)\n\n" +
          alignmentNotes.map((n) => `- ${n}`).join("\n")
        : "";
    const warningBlock =
      warnings.length > 0
        ? "\n\n### Integration warnings\n\n" + warnings.map((w) => `- ${w}`).join("\n")
        : "";

    const integrated = [
      `# ${data.title}`,
      "",
      `**Integrated lesson** · field \`${data.fieldSlug}\` · concept \`${data.conceptId}\``,
      `**Sources:** teacher submission + Lumen extended lesson (${longform.words.toLocaleString()} words)`,
      "",
      "---",
      "",
      "## How this lesson was assembled",
      "",
      bridge || "Teacher material is presented first; the extended academy lesson follows for depth.",
      alignmentBlock,
      warningBlock,
      "",
      "---",
      "",
      "## Teacher core (validated teaching narrative)",
      "",
      teacherCore,
      "",
      "---",
      "",
      "## Extended academy lesson (full depth)",
      "",
      longform.ok
        ? longform.full
        : "_No extended long-form file was found for this concept yet. Run python scripts/generate-longform.py, or rely on the teacher core above._",
      "",
    ].join("\n");

    const sql = await getSql();
    await sql`
      update teacher_lessons
      set integrated_body = ${integrated},
          integrated_at = now(),
          body = ${teacherCore},
          updated_at = now()
      where author_id = ${context.userId}
        and field_slug = ${data.fieldSlug}
        and concept_id = ${data.conceptId}
    `;

    return {
      ok: true as const,
      integratedChars: integrated.length,
      integratedWords: integrated.trim().split(/\s+/).filter(Boolean).length,
      longformWords: longform.words,
      warnings,
      preview: integrated.slice(0, 1500),
    };
  });
