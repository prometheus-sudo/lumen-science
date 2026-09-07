import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { RichText } from "@/components/rich-text";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FIELDS } from "@/lib/sciences";
import { listChat, sendChat, type ChatMessage } from "@/lib/server/chat";
import { composeSyllabus } from "@/lib/server/syllabus";

export const Route = createFileRoute("/oracle")({ component: Oracle });

function Oracle() {
  return (
    <RequireAuth>
      <OracleBody />
    </RequireAuth>
  );
}

function OracleBody() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldSlug, setFieldSlug] = useState(FIELDS[0]?.slug || "ecology");
  const [weeks, setWeeks] = useState(8);
  const [goal, setGoal] = useState("");
  const [composing, setComposing] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listChat()
      .then(setMessages)
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setDraft("");
    setBusy(true);
    const optimistic: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    try {
      const reply = await sendChat({ data: { message } });
      setMessages((m) => [...m, reply]);
    } catch {
      toast("Oracle could not reply. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onCompose(e: FormEvent) {
    e.preventDefault();
    if (goal.trim().length < 8) {
      toast("Describe your learning goal in a bit more detail");
      return;
    }
    setComposing(true);
    try {
      const syllabus = await composeSyllabus({
        data: { fieldSlug, goal: goal.trim(), weeks },
      });
      toast("Syllabus saved");
      await navigate({ to: "/syllabus/$id", params: { id: String(syllabus.id) } });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not compose a syllabus.");
    } finally {
      setComposing(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px]">
        <section className="flex min-h-0 flex-col">
          <h1 className="text-3xl font-semibold tracking-tight">Oracle</h1>
          <p className="mt-2 text-sm text-muted">
            Science Q&amp;A adapted to your level and region. Compile a personal syllabus when you
            want a structured path.
          </p>
          <div className="mt-6 flex-1 space-y-4">
            {messages.length === 0 && !busy ? (
              <div className="rounded-lg border border-dashed border-border bg-surface/60 p-5 text-sm leading-relaxed text-muted">
                Try: \u201cExplain entropy for secondary school,\u201d or \u201cWhat should I read before general
                relativity?\u201d
              </div>
            ) : null}
            {messages.map((m) => {
              const caption = m.role === "user" ? "You" : "Oracle \u00b7 science answer";
              return (
                <article
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-lg bg-primary px-4 py-3 text-sm leading-relaxed text-primary-fg"
                      : "mr-4 rounded-lg border border-border bg-surface px-4 py-3"
                  }
                >
                  <p
                    className={
                      m.role === "user"
                        ? "mb-1 text-[11px] font-medium uppercase tracking-wide text-primary-fg/80"
                        : "mb-1 text-[11px] font-medium uppercase tracking-wide text-muted"
                    }
                  >
                    {caption}
                  </p>
                  {m.role === "assistant" ? (
                    <RichText text={m.content} className="max-w-none" />
                  ) : (
                    m.content
                  )}
                </article>
              );
            })}
            {busy ? <p className="text-sm text-muted">Thinking\u2026</p> : null}
            <div ref={bottom} />
          </div>
          <form
            onSubmit={(e) => void onSend(e)}
            className="sticky bottom-16 mt-6 bg-bg/90 py-3 sm:bottom-0"
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a science question"
              rows={3}
              disabled={busy}
            />
            <Button type="submit" className="mt-3" disabled={busy || !draft.trim()}>
              Send
            </Button>
          </form>
        </section>

        <aside className="h-fit rounded-lg border border-border bg-surface p-4 lg:sticky lg:top-24">
          <h2 className="font-display text-xl tracking-tight">Personal syllabus</h2>
          <p className="mt-1 text-xs text-muted">
            Uses your account level and region to shape weekly goals for one science field.
          </p>
          <form className="mt-4 space-y-3" onSubmit={(e) => void onCompose(e)}>
            <div className="space-y-1">
              <Label htmlFor="field">Field</Label>
              <Select
                id="field"
                value={fieldSlug}
                onChange={(e) => setFieldSlug(e.target.value)}
              >
                {FIELDS.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="weeks">Weeks</Label>
              <Select
                id="weeks"
                value={String(weeks)}
                onChange={(e) => setWeeks(Number(e.target.value) || 8)}
              >
                {[4, 6, 8, 10, 12].map((w) => (
                  <option key={w} value={w}>
                    {w} weeks
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Prepare for first-year mechanics with weekly problems"
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={composing || goal.trim().length < 8}>
              {composing ? "Compiling\u2026" : "Compile syllabus"}
            </Button>
          </form>
        </aside>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
