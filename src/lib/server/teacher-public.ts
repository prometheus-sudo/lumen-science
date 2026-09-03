import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type { Concept } from "@/lib/sciences-types";
import { rowToConcept, type TeacherLessonRow } from "./teacher-lessons";

export type TeacherPublicCard = {
  userId: string;
  username: string | null;
  institution: string;
  qualification: string;
  credentialStatus: string;
};

async function authorCard(authorId: string): Promise<TeacherPublicCard> {
  const base: TeacherPublicCard = {
    userId: authorId,
    username: null,
    institution: "",
    qualification: "",
    credentialStatus: "none",
  };
  try {
    const sql = await getSql();
    const profiles = await sql<{
      username: string | null;
      teacher_institution: string | null;
      teacher_qualification: string | null;
      teacher_credential_status: string | null;
    }>`
      select username, teacher_institution, teacher_qualification, teacher_credential_status
      from profiles where user_id = ${authorId}
      limit 1
    `;
    const p = profiles[0];
    if (!p) return base;
    return {
      userId: authorId,
      username: p.username ? String(p.username) : null,
      institution: p.teacher_institution ?? "",
      qualification: p.teacher_qualification ?? "",
      credentialStatus: p.teacher_credential_status ?? "none",
    };
  } catch {
    return base;
  }
}

export const getTeacherLessonWithAuthor = createServerFn({ method: "GET" })
  .validator((input: { fieldSlug: string; conceptId: string }) => input)
  .handler(async ({ data }): Promise<{
    concept: Concept;
    author: TeacherPublicCard;
  } | null> => {
    const sql = await getSql();
    const rows = await sql<TeacherLessonRow>`
      select * from teacher_lessons
      where field_slug = ${data.fieldSlug}
        and concept_id = ${data.conceptId}
        and published = true
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      concept: rowToConcept(row),
      author: await authorCard(row.author_id),
    };
  });

export const getTeacherPublicByUsername = createServerFn({ method: "GET" })
  .validator((input: { username: string }) => ({
    username: (input.username || "").trim().toLowerCase().replace(/^@/, ""),
  }))
  .handler(async ({ data }): Promise<TeacherPublicCard | null> => {
    if (!data.username) return null;
    const sql = await getSql();
    try {
      const rows = await sql<{
        user_id: string;
        username: string | null;
        teacher_institution: string | null;
        teacher_qualification: string | null;
        teacher_credential_status: string | null;
        account_role: string | null;
      }>`
        select user_id, username, teacher_institution, teacher_qualification,
          teacher_credential_status, account_role
        from profiles
        where lower(username) = ${data.username}
        limit 1
      `;
      const p = rows[0];
      if (!p || p.account_role !== "teacher") return null;
      return {
        userId: p.user_id,
        username: p.username ? String(p.username) : null,
        institution: p.teacher_institution ?? "",
        qualification: p.teacher_qualification ?? "",
        credentialStatus: p.teacher_credential_status ?? "none",
      };
    } catch {
      return null;
    }
  });
