import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FIELDS } from "@/lib/sciences";
import { languageLabel, levelGuide, regionGuide } from "@/lib/learner";
import { grokChat } from "@/lib/xai";
import { loadProfile } from "./profile";

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type ChatRow = {
  id: number;
  role: string;
  content: string;
  created_at: string;
};

export const listChat = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ChatMessage[]> => {
    const sql = await getSql();
    const rows = await sql<ChatRow>`
      select id, role, content, created_at
      from chat_messages
      where user_id = ${context.userId}
      order by id desc
      limit 40
    `;
    return rows
      .reverse()
      .filter((r) => r.role === "user" || r.role === "assistant")
      .map((r) => ({
        id: r.id,
        role: r.role as "user" | "assistant",
        content: r.content,
        createdAt: r.created_at,
      }));
  });

export const sendChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string }) => {
    const message = input.message.trim().slice(0, 4000);
    if (!message) throw new Error("Message required");
    return { message };
  })
  .handler(async ({ context, data }): Promise<ChatMessage> => {
    const sql = await getSql();
    await sql`
      insert into chat_messages (user_id, role, content)
      values (${context.userId}, 'user', ${data.message})
    `;

    const history = await sql<ChatRow>`
      select id, role, content, created_at
      from chat_messages
      where user_id = ${context.userId}
      order by id desc
      limit 12
    `;
    const profile = await loadProfile(context.userId);
    const fieldList = FIELDS.map((f) => f.name).join(", ");

    const result = await grokChat(
      [
        {
          role: "system",
          content: `You are Lumen, the adaptive science tutor for a free global academy covering ${fieldList}.

Adapt EVERY reply to this learner:
- Learning level id: ${profile.learningLevel}
  Guidance: ${levelGuide(profile.learningLevel)}
- Region id: ${profile.region}
  Guidance: ${regionGuide(profile.region)}
- Preferred language label: ${languageLabel(profile.languagePref)}
  Reply in that language when the learner writes in it or asks for it; otherwise use clear international English with region-appropriate examples.

School-level behaviour:
- curious: primary / early secondary — short sentences, analogies, no dense jargon
- student: secondary / high school — curriculum vocabulary, units, exam-style steps
- undergraduate: university intro — equations, assumptions, limits of models
- researcher: graduate tone — methods, caveats, open problems (still no fake citations)

Rules:
- Answer from established science only.
- Never invent papers, authors, years, or DOIs.
- Use examples and units that fit the learner's region when possible.
- If they ask for a syllabus, outline weekly goals tied to their level.
- Offer to open or continue a structured path when useful.`,
        },
        ...history
          .reverse()
          .filter((r) => r.role === "user" || r.role === "assistant")
          .map((r) => ({
            role: r.role as "user" | "assistant",
            content: r.content,
          })),
      ],
      { maxTokens: 800, temperature: 0.45 },
    );

    const reply = result.ok ? result.text : result.error;

    const inserted = await sql<ChatRow>`
      insert into chat_messages (user_id, role, content)
      values (${context.userId}, 'assistant', ${reply})
      returning id, role, content, created_at
    `;
    const row = inserted[0];
    return {
      id: row.id,
      role: "assistant",
      content: row.content,
      createdAt: row.created_at,
    };
  });

export const clearChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from chat_messages where user_id = ${context.userId}`;
    return { ok: true as const };
  });
