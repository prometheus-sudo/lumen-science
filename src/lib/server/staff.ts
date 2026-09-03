import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FIELD_SLUGS } from "@/lib/sciences-types";
import { loadProfile } from "./profile";

export type StaffRole = "none" | "moderator" | "admin";

function newToken() {
  return randomBytes(24).toString("hex");
}

export async function loadStaff(userId: string): Promise<{
  staffRole: StaffRole;
  moderatorFields: string[];
}> {
  const sql = await getSql();
  try {
    const rows = await sql<{ staff_role: string | null; moderator_fields: string[] | null }>`
      select staff_role, moderator_fields from profiles where user_id = ${userId} limit 1
    `;
    const r = rows[0];
    const role = r?.staff_role === "admin" || r?.staff_role === "moderator" ? r.staff_role : "none";
    const fields = Array.isArray(r?.moderator_fields) ? r!.moderator_fields.filter(Boolean) : [];
    return { staffRole: role, moderatorFields: fields };
  } catch {
    return { staffRole: "none", moderatorFields: [] };
  }
}

async function requireAdmin(userId: string) {
  const s = await loadStaff(userId);
  if (s.staffRole !== "admin") throw new Error("Admin access required");
  return s;
}

async function requireModeratorOrAdmin(userId: string) {
  const s = await loadStaff(userId);
  if (s.staffRole !== "admin" && s.staffRole !== "moderator") {
    throw new Error("Moderator access required");
  }
  return s;
}

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { key: string }) => ({ key: (input.key || "").trim() }))
  .handler(async ({ context, data }) => {
    const expected = process.env.LUMEN_ADMIN_BOOTSTRAP_KEY || "";
    if (!expected || data.key !== expected) throw new Error("Invalid bootstrap key");
    const sql = await getSql();
    const admins = await sql<{ n: number }>`
      select count(*)::int as n from profiles where staff_role = 'admin'
    `.catch(() => [{ n: 0 }]);
    if ((admins[0]?.n ?? 0) > 0) throw new Error("An admin already exists");
    await sql`
      insert into profiles (user_id, staff_role, updated_at)
      values (${context.userId}, 'admin', now())
      on conflict (user_id) do update set staff_role = 'admin', updated_at = now()
    `;
    return { ok: true };
  });

export const getStaffSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const staff = await loadStaff(context.userId);
    const profile = await loadProfile(context.userId);
    return { ...staff, username: profile.username, accountRole: profile.accountRole };
  });

export const createStaffInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    email: string;
    staffRole: string;
    moderatorFields?: string[];
    expiresHours?: number;
  }) => {
    const email = (input.email || "").trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Valid email required");
    if (input.staffRole !== "admin" && input.staffRole !== "moderator") {
      throw new Error("Role must be admin or moderator");
    }
    const fields = (input.moderatorFields || []).filter((f) =>
      FIELD_SLUGS.includes(f as (typeof FIELD_SLUGS)[number]),
    );
    if (input.staffRole === "moderator" && fields.length === 0) {
      throw new Error("Moderators need at least one science field");
    }
    const hours = Math.min(168, Math.max(1, input.expiresHours ?? 48));
    return { email, staffRole: input.staffRole as "admin" | "moderator", fields, hours };
  })
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const token = newToken();
    const expires = new Date(Date.now() + data.hours * 3600 * 1000).toISOString();
    const sql = await getSql();
    await sql`
      insert into staff_invite_tokens (token, email, staff_role, moderator_fields, created_by, expires_at)
      values (
        ${token},
        ${data.email},
        ${data.staffRole},
        ${data.fields},
        ${context.userId},
        ${expires}
      )
    `;
    return {
      token,
      path: `/staff-invite/${token}`,
      email: data.email,
      expiresHours: data.hours,
      note: "Send this one-use link to the recipient. It expires after use or time limit.",
    };
  });

export const redeemStaffInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { token: string }) => ({
    token: (input.token || "").trim(),
  }))
  .handler(async ({ context, data }) => {
    if (!data.token) throw new Error("Missing token");
    const sql = await getSql();
    const rows = await sql<{
      token: string;
      email: string;
      staff_role: string;
      moderator_fields: string[] | null;
      expires_at: string;
      used_at: string | null;
    }>`
      select token, email, staff_role, moderator_fields, expires_at, used_at
      from staff_invite_tokens where token = ${data.token} limit 1
    `;
    const inv = rows[0];
    if (!inv) throw new Error("Invalid invite link");
    if (inv.used_at) throw new Error("This invite link was already used");
    if (new Date(inv.expires_at).getTime() < Date.now()) throw new Error("Invite link expired");

    await sql`
      update staff_invite_tokens
      set used_at = now(), used_by_user_id = ${context.userId}
      where token = ${data.token} and used_at is null
    `;
    const fields = Array.isArray(inv.moderator_fields) ? inv.moderator_fields : [];
    await sql`
      insert into profiles (user_id, staff_role, moderator_fields, account_role, updated_at)
      values (${context.userId}, ${inv.staff_role}, ${fields}, 'teacher', now())
      on conflict (user_id) do update set
        staff_role = excluded.staff_role,
        moderator_fields = excluded.moderator_fields,
        account_role = 'teacher',
        updated_at = now()
    `;
    return { ok: true, staffRole: inv.staff_role, email: inv.email };
  });

export const rejectTeacher = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; note?: string }) => ({
    userId: (input.userId || "").trim(),
    note: (input.note || "").trim().slice(0, 1000),
  }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (!data.userId) throw new Error("userId required");
    const sql = await getSql();
    await sql`
      update profiles
      set teacher_credential_status = 'rejected',
          teacher_credential_note = ${data.note || "Credentials rejected"},
          updated_at = now()
      where user_id = ${data.userId}
    `;
    await sql`
      update teacher_lessons set published = false, updated_at = now()
      where author_id = ${data.userId}
    `;
    await sql`delete from teacher_lessons where author_id = ${data.userId}`;
    return { ok: true };
  });

export const verifyTeacher = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string }) => ({ userId: (input.userId || "").trim() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      update profiles
      set teacher_credential_status = 'verified', updated_at = now()
      where user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const listPendingTeachers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    try {
      return await sql<{
        user_id: string;
        username: string | null;
        teacher_institution: string | null;
        teacher_qualification: string | null;
        teacher_credential_note: string | null;
        teacher_credential_submitted_at: string | null;
      }>`
        select user_id, username, teacher_institution, teacher_qualification,
          teacher_credential_note, teacher_credential_submitted_at
        from profiles
        where teacher_credential_status = 'pending'
        order by teacher_credential_submitted_at desc nulls last
        limit 100
      `;
    } catch {
      return [];
    }
  });

export const listOpenReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const staff = await requireModeratorOrAdmin(context.userId);
    const sql = await getSql();
    try {
      const rows = await sql<{
        id: number;
        reporter_user_id: string;
        field_slug: string;
        concept_id: string;
        reason: string;
        status: string;
        created_at: string;
      }>`
        select id, reporter_user_id, field_slug, concept_id, reason, status, created_at
        from content_reports
        where status = 'open'
        order by created_at desc
        limit 200
      `;
      if (staff.staffRole === "moderator") {
        const allowed = new Set(staff.moderatorFields);
        return rows.filter((r) => allowed.has(r.field_slug));
      }
      return rows;
    } catch {
      return [];
    }
  });

export const resolveReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    reportId: number;
    action: string;
    note?: string;
    unpublishLesson?: boolean;
  }) => ({
    reportId: Number(input.reportId),
    action: input.action === "remove_content" ? "remove_content" : "dismiss",
    note: (input.note || "").trim().slice(0, 1000),
    unpublishLesson: Boolean(input.unpublishLesson),
  }))
  .handler(async ({ context, data }) => {
    const staff = await requireModeratorOrAdmin(context.userId);
    const sql = await getSql();
    const reports = await sql<{ id: number; field_slug: string; concept_id: string }>`
      select id, field_slug, concept_id from content_reports where id = ${data.reportId} limit 1
    `;
    const rep = reports[0];
    if (!rep) throw new Error("Report not found");
    if (staff.staffRole === "moderator" && !staff.moderatorFields.includes(rep.field_slug)) {
      throw new Error("Outside your moderated fields");
    }
    if (data.action === "remove_content" || data.unpublishLesson) {
      await sql`
        update teacher_lessons
        set published = false, updated_at = now()
        where field_slug = ${rep.field_slug} and concept_id = ${rep.concept_id}
      `;
    }
    await sql`
      update content_reports
      set status = ${data.action === "remove_content" ? "removed" : "dismissed"},
          handled_by = ${context.userId},
          handled_at = now(),
          handler_note = ${data.note}
      where id = ${data.reportId}
    `;
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    try {
      return await sql<{
        user_id: string;
        username: string | null;
        account_role: string | null;
        staff_role: string | null;
        teacher_credential_status: string | null;
      }>`
        select user_id, username, account_role, staff_role, teacher_credential_status
        from profiles
        order by updated_at desc nulls last
        limit 200
      `;
    } catch {
      return [];
    }
  });

export const adminRemoveUserContent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string }) => ({ userId: (input.userId || "").trim() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (!data.userId) throw new Error("userId required");
    if (data.userId === context.userId) throw new Error("Cannot wipe your own admin account this way");
    const sql = await getSql();
    await sql`delete from teacher_lessons where author_id = ${data.userId}`;
    await sql`
      update profiles
      set account_role = 'student',
          teacher_credential_status = 'rejected',
          staff_role = 'none',
          updated_at = now()
      where user_id = ${data.userId}
    `;
    return { ok: true };
  });
