import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  isLanguage,
  isLearningLevel,
  isRegion,
  type LanguageId,
  type LearningLevelId,
  type RegionId,
} from "@/lib/learner";

export type TeacherCredentialStatus = "none" | "pending" | "verified" | "rejected";

export type Profile = {
  userId: string;
  learningLevel: LearningLevelId;
  region: RegionId;
  languagePref: LanguageId;
  onboardingComplete: boolean;
  accountRole: "student" | "teacher";
  teacherCredentialStatus: TeacherCredentialStatus;
  teacherCredentialNote: string;
  teacherInstitution: string;
  teacherQualification: string;
  username: string | null;
};

type ProfileRow = {
  user_id: string;
  learning_level: string;
  region: string;
  language_pref: string;
  onboarding_complete: boolean;
  account_role?: string;
  teacher_credential_status?: string;
  teacher_credential_note?: string;
  teacher_institution?: string;
  teacher_qualification?: string;
  username?: string | null;
};

function mapCredStatus(v: string | undefined): TeacherCredentialStatus {
  if (v === "pending" || v === "verified" || v === "rejected") return v;
  return "none";
}

function mapProfile(row: ProfileRow): Profile {
  const role = row.account_role === "teacher" ? "teacher" : "student";
  return {
    userId: row.user_id,
    learningLevel: isLearningLevel(row.learning_level) ? row.learning_level : "student",
    region: isRegion(row.region) ? row.region : "north-america",
    languagePref: isLanguage(row.language_pref) ? row.language_pref : "en",
    onboardingComplete: Boolean(row.onboarding_complete),
    accountRole: role,
    teacherCredentialStatus: mapCredStatus(row.teacher_credential_status),
    teacherCredentialNote: row.teacher_credential_note ?? "",
    teacherInstitution: row.teacher_institution ?? "",
    teacherQualification: row.teacher_qualification ?? "",
    username: row.username ? String(row.username) : null,
  };
}

export async function loadProfile(userId: string): Promise<Profile> {
  const sql = await getSql();
  try {
    const rows = await sql<ProfileRow>`
      select user_id, learning_level, region, language_pref, onboarding_complete, account_role,
        teacher_credential_status, teacher_credential_note, teacher_institution, teacher_qualification, username
      from profiles where user_id = ${userId}
    `;
    if (rows[0]) return mapProfile(rows[0]);
    const inserted = await sql<ProfileRow>`
      insert into profiles (user_id) values (${userId})
      returning user_id, learning_level, region, language_pref, onboarding_complete, account_role,
        teacher_credential_status, teacher_credential_note, teacher_institution, teacher_qualification, username
    `;
    return mapProfile(inserted[0]);
  } catch {
    const rows = await sql<ProfileRow>`
      select user_id, learning_level, region, language_pref, onboarding_complete, account_role
      from profiles where user_id = ${userId}
    `;
    if (rows[0]) return mapProfile(rows[0]);
    const inserted = await sql<ProfileRow>`
      insert into profiles (user_id) values (${userId})
      returning user_id, learning_level, region, language_pref, onboarding_complete, account_role
    `;
    return mapProfile(inserted[0]);
  }
}

export const getProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Profile> => loadProfile(context.userId));

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { learningLevel: string; region: string; languagePref: string }) => {
    if (!isLearningLevel(input.learningLevel)) throw new Error("Invalid level");
    if (!isRegion(input.region)) throw new Error("Invalid region");
    if (!isLanguage(input.languagePref)) throw new Error("Invalid language");
    return input as {
      learningLevel: LearningLevelId;
      region: RegionId;
      languagePref: LanguageId;
    };
  })
  .handler(async ({ context, data }): Promise<Profile> => {
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, learning_level, region, language_pref, onboarding_complete, updated_at)
      values (${context.userId}, ${data.learningLevel}, ${data.region}, ${data.languagePref}, true, now())
      on conflict (user_id) do update set
        learning_level = excluded.learning_level,
        region = excluded.region,
        language_pref = excluded.language_pref,
        onboarding_complete = true,
        updated_at = now()
    `;
    return loadProfile(context.userId);
  });

export const submitTeacherCredentials = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { institution: string; qualification: string; note: string }) => {
    if (!input.institution.trim() || input.institution.trim().length < 3) {
      throw new Error("Institution / affiliation required");
    }
    if (!input.qualification.trim() || input.qualification.trim().length < 3) {
      throw new Error("Qualification or teaching credential required");
    }
    return {
      institution: input.institution.trim().slice(0, 200),
      qualification: input.qualification.trim().slice(0, 400),
      note: input.note.trim().slice(0, 1000),
    };
  })
  .handler(async ({ context, data }): Promise<Profile> => {
    const sql = await getSql();
    try {
      await sql`
        insert into profiles (
          user_id, teacher_institution, teacher_qualification, teacher_credential_note,
          teacher_credential_status, teacher_credential_submitted_at, account_role, updated_at
        )
        values (
          ${context.userId}, ${data.institution}, ${data.qualification}, ${data.note},
          'pending', now(), 'teacher', now()
        )
        on conflict (user_id) do update set
          teacher_institution = excluded.teacher_institution,
          teacher_qualification = excluded.teacher_qualification,
          teacher_credential_note = excluded.teacher_credential_note,
          teacher_credential_status = 'pending',
          teacher_credential_submitted_at = now(),
          account_role = 'teacher',
          updated_at = now()
      `;
    } catch {
      await sql`
        update profiles set account_role = 'teacher', updated_at = now()
        where user_id = ${context.userId}
      `;
    }
    return loadProfile(context.userId);
  });

export const setAccountRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { role: string }) => {
    if (input.role !== "student" && input.role !== "teacher") {
      throw new Error("Invalid role");
    }
    return input as { role: "student" | "teacher" };
  })
  .handler(async ({ context, data }): Promise<Profile> => {
    if (data.role === "teacher") {
      throw new Error("Submit teaching credentials to enable Teach.");
    }
    const sql = await getSql();
    await sql`
      update profiles
      set account_role = 'student', updated_at = now()
      where user_id = ${context.userId}
    `;
    return loadProfile(context.userId);
  });

function normalizeUsername(raw: string): string {
  const u = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
  if (u.length < 3) {
    throw new Error("Username must be at least 3 characters (letters, numbers, underscore).");
  }
  return u;
}

export const setUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { username: string }) => ({
    username: normalizeUsername(input.username || ""),
  }))
  .handler(async ({ context, data }): Promise<Profile> => {
    const sql = await getSql();
    try {
      const taken = await sql<{ user_id: string }>`
        select user_id from profiles
        where lower(username) = ${data.username} and user_id <> ${context.userId}
        limit 1
      `;
      if (taken[0]) throw new Error("That username is already taken.");
      await sql`
        insert into profiles (user_id, username, updated_at)
        values (${context.userId}, ${data.username}, now())
        on conflict (user_id) do update set username = excluded.username, updated_at = now()
      `;
    } catch (e) {
      if (e instanceof Error && e.message.includes("taken")) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/unique|duplicate/i.test(msg)) throw new Error("That username is already taken.");
      throw e instanceof Error ? e : new Error("Could not set username");
    }
    return loadProfile(context.userId);
  });
