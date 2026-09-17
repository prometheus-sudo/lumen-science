import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type ChatMessage = {
  id: number;
  thread_id: string;
  field_slug: string | null;
  concept_id: string | null;
  from_user_id: string;
  to_user_id: string;
  body: string;
  created_at: string;
  from_username?: string | null;
  to_username?: string | null;
};

/** @deprecated use ChatMessage */
export type TeacherMessage = ChatMessage;

function threadKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

async function usernameMap(sql: Awaited<ReturnType<typeof getSql>>, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map<string, string>();
  try {
    const rows = await sql<{ user_id: string; username: string | null }>`
      select user_id, username from profiles where user_id = any(${unique})
    `;
    return new Map(rows.map((r) => [r.user_id, r.username || ""]));
  } catch {
    return new Map<string, string>();
  }
}

/** Directory of any Lumen user who set a username (students + teachers). */
export const listDirectoryUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    try {
      const rows = await sql<{ user_id: string; username: string | null; account_role: string | null }>`
        select user_id, username, account_role from profiles
        where username is not null and username <> '' and user_id <> ${context.userId}
        order by username
        limit 200
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        username: String(r.username),
        label: `@${r.username}`,
        role: r.account_role === "teacher" ? "teacher" : "student",
      }));
    } catch {
      return [];
    }
  });

/** Keep export for older UI imports */
export const listTeachers = listDirectoryUsers;

export const listMyMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    try {
      const rows = await sql<ChatMessage>`
        select * from teacher_messages
        where from_user_id = ${context.userId} or to_user_id = ${context.userId}
        order by created_at asc
        limit 500
      `;
      const map = await usernameMap(
        sql,
        rows.flatMap((r) => [r.from_user_id, r.to_user_id]),
      );
      return rows.map((r) => ({
        ...r,
        from_username: map.get(r.from_user_id) ?? null,
        to_username: map.get(r.to_user_id) ?? null,
      }));
    } catch {
      return [];
    }
  });

export const sendTeacherMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      toUsername?: string;
      toUserId?: string;
      body: string;
      fieldSlug?: string;
      conceptId?: string;
    }) => {
      const body = (input.body || "").trim();
      if (body.length < 1) throw new Error("Message too short");
      if (body.length > 4000) throw new Error("Message too long");
      const toUsername = (input.toUsername || "").trim().toLowerCase().replace(/^@/, "");
      const toUserId = (input.toUserId || "").trim();
      if (!toUsername && !toUserId) throw new Error("Choose someone by @username");
      return {
        toUsername: toUsername || null,
        toUserId: toUserId || null,
        body,
        fieldSlug: input.fieldSlug || null,
        conceptId: input.conceptId || null,
      };
    },
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    let toUserId = data.toUserId;
    if (data.toUsername) {
      const rows = await sql<{ user_id: string }>`
        select user_id from profiles
        where lower(username) = ${data.toUsername}
        limit 1
      `;
      if (!rows[0]) throw new Error("No Lumen user with that username");
      toUserId = rows[0].user_id;
    }
    if (!toUserId) throw new Error("Choose someone by @username");
    if (toUserId === context.userId) throw new Error("Cannot message yourself");
    const tid = threadKey(context.userId, toUserId);
    await sql`
      insert into teacher_messages (thread_id, field_slug, concept_id, from_user_id, to_user_id, body)
      values (${tid}, ${data.fieldSlug}, ${data.conceptId}, ${context.userId}, ${toUserId}, ${data.body})
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
    return { ok: true, message: "Report received. Moderators will review." };
  });
