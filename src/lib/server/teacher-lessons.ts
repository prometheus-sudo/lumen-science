import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Concept } from "@/lib/sciences-types";
import { FIELD_SLUGS } from "@/lib/sciences-types";
import { loadProfile } from "./profile";

export type TeacherLessonRow = {
  id: number;
  author_id: string;
  field_slug: string;
  module_name: string;
  concept_id: string;
  title: string;
  why_it_matters: string;
  body: string;
  key_ideas: unknown;
  objectives: unknown;
  terms: unknown;
  check_questions: unknown;
  pitfalls: unknown;
  minutes: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asTerms(v: unknown): { term: string; definition: string }[] {
  if (!Array.isArray(v)) return [];
  const out: { term: string; definition: string }[] = [];
  for (const item of v) {
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      if (typeof o.term === "string" && typeof o.definition === "string") {
        out.push({ term: o.term, definition: o.definition });
      }
    }
  }
  return out;
}

export function rowToConcept(row: TeacherLessonRow): Concept {
  return {
    id: row.concept_id,
    module: row.module_name || "Teacher lessons",
    title: row.title,
    whyItMatters: row.why_it_matters,
    summary: row.body,
    keyIdeas: asStringArray(row.key_ideas),
    objectives: asStringArray(row.objectives),
    terms: asTerms(row.terms),
    checkQuestions: asStringArray(row.check_questions),
    pitfalls: asStringArray(row.pitfalls),
    minutes: row.minutes,
  };
}

export type LessonInput = {
  fieldSlug: string;
  moduleName: string;
  conceptId: string;
  title: string;
  whyItMatters: string;
  body: string;
  keyIdeas: string[];
  objectives: string[];
  terms: { term: string; definition: string }[];
  checkQuestions: string[];
  pitfalls: string[];
  minutes: number;
  published: boolean;
};

function validateLesson(input: LessonInput): LessonInput {
  if (!FIELD_SLUGS.includes(input.fieldSlug as (typeof FIELD_SLUGS)[number])) {
    throw new Error("Invalid field");
  }
  const conceptId = input.conceptId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!conceptId || conceptId.length < 2) throw new Error("Invalid concept id");
  if (!input.title.trim()) throw new Error("Title required");
  if (!input.body.trim() || input.body.trim().length < 80) {
    throw new Error("Body must be a real lesson (at least ~80 characters)");
  }
  return {
    ...input,
    fieldSlug: input.fieldSlug,
    moduleName: input.moduleName.trim() || "Teacher lessons",
    conceptId,
    title: input.title.trim(),
    whyItMatters: input.whyItMatters.trim(),
    body: input.body.trim(),
    keyIdeas: input.keyIdeas.map((s) => s.trim()).filter(Boolean),
    objectives: input.objectives.map((s) => s.trim()).filter(Boolean),
    terms: input.terms.filter((t) => t.term.trim() && t.definition.trim()),
    checkQuestions: input.checkQuestions.map((s) => s.trim()).filter(Boolean),
    pitfalls: input.pitfalls.map((s) => s.trim()).filter(Boolean),
    minutes: Math.min(120, Math.max(5, Number(input.minutes) || 25)),
    published: Boolean(input.published),
  };
}

async function requireTeacher(userId: string) {
  const profile = await loadProfile(userId);
  if (profile.accountRole !== "teacher") {
    throw new Error("Teacher role required. Enable teacher mode in Account.");
  }
  return profile;
}

export const listMyTeacherLessons = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireTeacher(context.userId);
    const sql = await getSql();
    const rows = await sql<TeacherLessonRow>`
      select * from teacher_lessons
      where author_id = ${context.userId}
      order by updated_at desc
    `;
    return rows;
  });

export const listPublishedTeacherLessons = createServerFn({ method: "GET" })
  .validator((input: { fieldSlug: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<TeacherLessonRow>`
      select * from teacher_lessons
      where field_slug = ${data.fieldSlug} and published = true
      order by module_name, title
    `;
    return rows.map(rowToConcept);
  });

export const getTeacherLesson = createServerFn({ method: "GET" })
  .validator((input: { fieldSlug: string; conceptId: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<TeacherLessonRow>`
      select * from teacher_lessons
      where field_slug = ${data.fieldSlug}
        and concept_id = ${data.conceptId}
        and published = true
      limit 1
    `;
    return rows[0] ? rowToConcept(rows[0]) : null;
  });

export const saveTeacherLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: LessonInput) => validateLesson(input))
  .handler(async ({ context, data }) => {
    await requireTeacher(context.userId);
    const sql = await getSql();
    const rows = await sql<TeacherLessonRow>`
      insert into teacher_lessons (
        author_id, field_slug, module_name, concept_id, title, why_it_matters, body,
        key_ideas, objectives, terms, check_questions, pitfalls, minutes, published, updated_at
      ) values (
        ${context.userId},
        ${data.fieldSlug},
        ${data.moduleName},
        ${data.conceptId},
        ${data.title},
        ${data.whyItMatters},
        ${data.body},
        ${JSON.stringify(data.keyIdeas)}::jsonb,
        ${JSON.stringify(data.objectives)}::jsonb,
        ${JSON.stringify(data.terms)}::jsonb,
        ${JSON.stringify(data.checkQuestions)}::jsonb,
        ${JSON.stringify(data.pitfalls)}::jsonb,
        ${data.minutes},
        ${data.published},
        now()
      )
      on conflict (field_slug, concept_id) do update set
        module_name = excluded.module_name,
        title = excluded.title,
        why_it_matters = excluded.why_it_matters,
        body = excluded.body,
        key_ideas = excluded.key_ideas,
        objectives = excluded.objectives,
        terms = excluded.terms,
        check_questions = excluded.check_questions,
        pitfalls = excluded.pitfalls,
        minutes = excluded.minutes,
        published = excluded.published,
        updated_at = now(),
        author_id = ${context.userId}
      returning *
    `;
    return rows[0];
  });

export const deleteTeacherLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => input)
  .handler(async ({ context, data }) => {
    await requireTeacher(context.userId);
    const sql = await getSql();
    await sql`
      delete from teacher_lessons
      where id = ${data.id} and author_id = ${context.userId}
    `;
    return { ok: true };
  });
