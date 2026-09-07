import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FIELD_SLUGS } from "@/lib/sciences-types";
import { getConcept, getField } from "@/lib/sciences";
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
  fieldSlug: string;
  conceptId: string;
};

function safeSeg(s: string) {
  return /^[a-z0-9_-]+$/i.test(s);
}

async function requireTeacher(userId: string) {
  const profile = await loadProfile(userId);
  if (profile.accountRole !== "teacher") {
    throw new Error("Teacher role required. Submit credentials on the Teach page.");
  }
  if (profile.teacherCredentialStatus === "rejected") {
    throw new Error("Credentials rejected \u2014 fact-check and publishing are disabled.");
  }
  return profile;
}

async function loadLongformOutline(fieldSlug: string, conceptId: string) {
  const candidates = [
    path.join(process.cwd(), "src/lib/curriculum/longform", fieldSlug, `${conceptId}.md`),
    path.join(process.cwd(), "public/longform", fieldSlug, `${conceptId}.md`),
  ];
  for (const file of candidates) {
    try {
      const body = await readFile(file, "utf8");
      const headings = body
        .split("\n")
        .filter((l) => l.startsWith("#"))
        .slice(0, 40);
      const words = body.trim().split(/\s+/).filter(Boolean).length;
      return { ok: true as const, words, headings, head: body.slice(0, 7000), full: body };
    } catch {
      /* try next */
    }
  }
  return { ok: false as const, words: 0, headings: [] as string[], head: "", full: "" };
}

export const factCheckTeacherLesson = createServerFn({ method: "POST" })
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
    if (body.length < 40) throw new Error("Paste a substantial lesson body to check (40+ characters)");
    return {
      fieldSlug: d.fieldSlug,
      conceptId: d.conceptId.trim(),
      title: (d.title || "").trim() || "Untitled",
      whyItMatters: (d.whyItMatters || "").trim(),
      body: body.slice(0, 14000),
    };
  })
  .handler(async ({ context, data }): Promise<FactCheckReport> => {
    await requireTeacher(context.userId);

    const field = getField(data.fieldSlug);
    const found = getConcept(data.fieldSlug, data.conceptId);
    const longform = await loadLongformOutline(data.fieldSlug, data.conceptId);
    const curriculumHints = found?.concept
      ? [
          `Curriculum title: ${found.concept.title}`,
          `Why it matters: ${found.concept.whyItMatters || ""}`,
          `Key ideas: ${(found.concept.keyIdeas || []).slice(0, 8).join("; ")}`,
        ].join("\n")
      : "No pre-seeded concept row; check against general established science for this field.";

    const system = `You are Lumen's automated science fact-checker for teacher lesson submissions.

Task: Inspect the teacher's draft for factual validity, context, and fit to the topic.
Return ONLY a JSON object with this shape:
{
  "verdict": "pass" | "revise" | "fail",
  "score": 0-100,
  "summary": "2-4 sentences overall assessment",
  "issues": [
    {
      "claim": "quoted or paraphrased claim from the teacher text",
      "severity": "error" | "warning" | "note",
      "explanation": "why this is problematic relative to established science",
      "suggestion": "how to fix or soften the claim"
    }
  ],
  "strengths": ["what the draft gets right"]
}

Rules:
- Base judgments on well-established science only. Never invent papers, DOIs, or authors.
- severity "error" = clearly false or dangerously misleading for learners.
- severity "warning" = oversimplified, missing important caveats, or weakly supported.
- severity "note" = style/clarity, not a factual failure.
- verdict "fail" if any critical error or score < 45.
- verdict "revise" if warnings dominate or score 45-74.
- verdict "pass" if score >= 75 and no severity "error".
- Check that content actually addresses the stated field/topic, not an unrelated subject.
- Prefer SI units and age-appropriate accuracy; do not require perfect pedagogy for a pass.`;

    const userMsg = [
      `Field: ${field?.name || data.fieldSlug} (${data.fieldSlug})`,
      `Concept id: ${data.conceptId}`,
      `Title: ${data.title}`,
      data.whyItMatters ? `Teacher "why it matters": ${data.whyItMatters}` : "",
      "",
      "Curriculum hints:",
      curriculumHints,
      "",
      longform.ok
        ? `Academy longform outline (${longform.words} words). Headings:\n${longform.headings.slice(0, 25).join("\n")}\n\nExcerpt:\n${longform.head}`
        : "No academy longform file found for this concept; use field knowledge only.",
      "",
      "--- TEACHER DRAFT ---",
      data.body,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await grokChat([
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ]);

    let parsed: Partial<{
      verdict: string;
      score: number;
      summary: string;
      issues: FactIssue[];
      strengths: string[];
    }> = {};
    try {
      parsed = extractJson(result.text) as typeof parsed;
    } catch {
      parsed = {};
    }

    const issues: FactIssue[] = Array.isArray(parsed.issues)
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

    let verdict: FactCheckReport["verdict"] =
      parsed.verdict === "pass" || parsed.verdict === "fail" || parsed.verdict === "revise"
        ? parsed.verdict
        : score >= 75 && !issues.some((i) => i.severity === "error")
          ? "pass"
          : score < 45 || issues.some((i) => i.severity === "error")
            ? "fail"
            : "revise";

    if (issues.some((i) => i.severity === "error")) {
      if (verdict === "pass") verdict = "revise";
      if (score < 50) verdict = "fail";
    }

    const report: FactCheckReport = {
      verdict,
      score,
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary.trim()
          : "Fact check complete.",
      issues,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.filter((s): s is string => typeof s === "string")
        : [],
      checkedAt: new Date().toISOString(),
      fieldSlug: data.fieldSlug,
      conceptId: data.conceptId,
    };

    const sql = await getSql();
    try {
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
    } catch {
      /* columns may be missing until migration */
    }

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
    const sql = await getSql();

    try {
      const rows = await sql<{ fact_check_status: string | null }>`
        select fact_check_status from teacher_lessons
        where author_id = ${context.userId}
          and field_slug = ${data.fieldSlug}
          and concept_id = ${data.conceptId}
        limit 1
      `;
      const st = rows[0]?.fact_check_status;
      if (st && st !== "pass") {
        throw new Error(
          `Fact-check verdict is "${st}". Fix issues and re-run the checker until PASS before integrating.`,
        );
      }
      if (!st) {
        throw new Error("Run the automated fact-checker first and get a PASS verdict.");
      }
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.includes("PASS") ||
          e.message.includes("Fact-check") ||
          e.message.includes("verdict"))
      ) {
        throw e;
      }
    }

    const longform = await loadLongformOutline(data.fieldSlug, data.conceptId);

    const system = `You are Lumen's lesson integration editor.
Merge a teacher's validated submission with the academy's extended lesson.
Return ONLY JSON:
{
  "bridge": "markdown 300-800 words introducing the combined lesson",
  "teacherCore": "cleaned teacher narrative (preserve voice; fix only clear errors)",
  "alignmentNotes": ["teacher point \u2192 longform section"],
  "warnings": ["residual risks"]
}
Never invent citations. Prefer established science if conflict; note it in warnings.`;

    const result = await grokChat([
      { role: "system", content: system },
      {
        role: "user",
        content: [
          `Title: ${data.title}`,
          `Field: ${data.fieldSlug} Concept: ${data.conceptId}`,
          data.whyItMatters ? `Why: ${data.whyItMatters}` : "",
          "",
          "TEACHER BODY:",
          data.body,
          "",
          longform.ok
            ? `LONGFORM (${longform.words} words) excerpt:\n${longform.head}`
            : "No longform on disk.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ]);

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
        ? "\n\n### Alignment map (teacher \u2192 extended lesson)\n\n" +
          alignmentNotes.map((n) => `- ${n}`).join("\n")
        : "";
    const warningBlock =
      warnings.length > 0
        ? "\n\n### Integration warnings\n\n" + warnings.map((w) => `- ${w}`).join("\n")
        : "";

    const integrated = [
      `# ${data.title}`,
      "",
      `**Integrated lesson** \u00b7 \`${data.fieldSlug}\` / \`${data.conceptId}\`,
      `**Sources:** teacher submission (fact-checked) + Lumen extended lesson (${longform.words.toLocaleString()} words)`,
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
        : "_No extended long-form file was found for this concept yet._",
      "",
    ].join("\n");

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
