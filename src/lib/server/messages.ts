import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type TeacherMessage = {
  id: number;
  thread_id: string;
  field_slug: string | null;
  concept_id: string | null;
  from_user_id: string;
  to_user_id: string;
  body: string;
  created_at: string;
};

function threadKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

export const listTeachers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    try {
      const rows = await sql<{ user_id: string; username: string | null }>`
        select user_id, username from profiles
        where account_role = 'teacher'
        order by username nulls last
        limit 50
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        label: r.username ? `@${r.username}` : `Teacher ${r.user_id.slice(0, 8)}`,
      }));
    } catch {
      return [];
    }
  });

export const listMyMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    try {
      const rows = await sql<TeacherMessage>`
        select * from teacher_messages
        where from_user_id = ${context.userId} or to_user_id = ${context.userId}
        order by created_at desc
        limit 100
      `;
      return rows;
    } catch {
      return [];
    }
  });

export const sendTeacherMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { toUserId: string; body: string; fieldSlug?: string; conceptId?: string }) => {
    const body = (input.body || "").trim();
    if (body.length < 2) throw new Error("Message too short");
    if (body.length > 4000) throw new Error("Message too long");
    if (!input.toUserId) throw new Error("Choose a teacher");
    return {
      toUserId: input.toUserId,
      body,
      fieldSlug: input.fieldSlug || null,
      conceptId: input.conceptId || null,
    };
  })
  .handler(async ({ context, data }) => {
    if (data.toUserId === context.userId) throw new Error("Cannot message yourself");
    const sql = await getSql();
    const tid = threadKey(context.userId, data.toUserId);
    await sql`
      insert into teacher_messages (thread_id, field_slug, concept_id, from_user_id, to_user_id, body)
      values (${tid}, ${data.fieldSlug}, ${data.conceptId}, ${context.userId}, ${data.toUserId}, ${data.body})
    `;
    return { ok: true };
  });

export const reportTeacherContent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    fieldSlug: string;
    conceptId: string;
    reason: string;
    teacherLessonId?: number;
  }) => {
    const reason = (input.reason || "").trim();
    if (reason.length < 10) throw new Error("Please describe the problem (at least 10 characters).");
    if (!input.fieldSlug || !input.conceptId) throw new Error("Missing topic");
    return {
      fieldSlug: input.fieldSlug,
      conceptId: input.conceptId,
      reason: reason.slice(0, 2000),
      teacherLessonId: input.teacherLessonId ?? null,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into content_reports (reporter_user_id, field_slug, concept_id, teacher_lesson_id, reason)
      values (${context.userId}, ${data.fieldSlug}, ${data.conceptId}, ${data.teacherLessonId}, ${data.reason})
    `;
    return { ok: true, message: "Report received. Moderators will review the teacher content." };
  });
