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

export type Profile = {
  userId: string;
  learningLevel: LearningLevelId;
  region: RegionId;
  languagePref: LanguageId;
  onboardingComplete: boolean;
  accountRole: "student" | "teacher";
};

type ProfileRow = {
  user_id: string;
  learning_level: string;
  region: string;
  language_pref: string;
  onboarding_complete: boolean;
  account_role?: string;
};

function mapProfile(row: ProfileRow): Profile {
  const role = row.account_role === "teacher" ? "teacher" : "student";
  return {
    userId: row.user_id,
    learningLevel: isLearningLevel(row.learning_level) ? row.learning_level : "student",
    region: isRegion(row.region) ? row.region : "north-america",
    languagePref: isLanguage(row.language_pref) ? row.language_pref : "en",
    onboardingComplete: Boolean(row.onboarding_complete),
    accountRole: role,
  };
}

export async function loadProfile(userId: string): Promise<Profile> {
  const sql = await getSql();
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
    const rows = await sql<ProfileRow>`
      insert into profiles (user_id, learning_level, region, language_pref, onboarding_complete, updated_at)
      values (${context.userId}, ${data.learningLevel}, ${data.region}, ${data.languagePref}, true, now())
      on conflict (user_id) do update set
        learning_level = excluded.learning_level,
        region = excluded.region,
        language_pref = excluded.language_pref,
        onboarding_complete = true,
        updated_at = now()
      returning user_id, learning_level, region, language_pref, onboarding_complete, account_role
    `;
    return mapProfile(rows[0]);
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
    const sql = await getSql();
    const rows = await sql<ProfileRow>`
      update profiles
      set account_role = ${data.role}, updated_at = now()
      where user_id = ${context.userId}
      returning user_id, learning_level, region, language_pref, onboarding_complete, account_role
    `;
    if (!rows[0]) {
      const inserted = await sql<ProfileRow>`
        insert into profiles (user_id, account_role)
        values (${context.userId}, ${data.role})
        returning user_id, learning_level, region, language_pref, onboarding_complete, account_role
      `;
      return mapProfile(inserted[0]);
    }
    return mapProfile(rows[0]);
  });
