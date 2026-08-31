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
  const [fieldSlug, setFieldSlug] = useState(FIELDS[0].slug);
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
    setComposing(true);
    try {
      const syllabus = await composeSyllabus({
        data: { fieldSlug, goal, weeks },
      });
      toast("Syllabus saved");
      await navigate({ to: "/syllabus/$id", params: { id: String(syllabus.id) } });
    } catch {
      toast("Could not compile a syllabus just now.");
    } finally {
      setComposing(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <section className="flex min-h-[28rem] flex-col">
          <h1 className="font-display text-3xl tracking-tight">Oracle</h1>
          <p className="mt-2 text-sm text-muted">
            Ask across the sciences. Answers follow your level and region. Oracle will not invent
            papers or DOIs.
          </p>
          <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-surface p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted">Start with a question in any science field.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-lg bg-primary/10 px-3 py-2 text-sm"
                      : "mr-4 rounded-lg border border-border px-3 py-2 text-sm"
                  }
                >
                  {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                </div>
              ))
            )}
            {busy ? <p className="text-sm text-muted">Oracle is thinking…</p> : null}
            <div ref={bottom} />
          </div>
          <form onSubmit={(e) => void onSend(e)} className="sticky bottom-16 mt-6 bg-bg/90 py-3 sm:bottom-0">
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

        <aside className="h-fit rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Compose a syllabus</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Name a field and a goal. Lumen compiles a week-by-week path and saves it to your account.
          </p>
          <form onSubmit={(e) => void onCompose(e)} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field">Field</Label>
              <Select
                id="field"
                value={fieldSlug}
                onChange={(e) => setFieldSlug(e.target.value as typeof fieldSlug)}
              >
                {FIELDS.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeks">Weeks</Label>
              <Select
                id="weeks"
                value={String(weeks)}
                onChange={(e) => setWeeks(Number(e.target.value))}
              >
                {[4, 6, 8, 12, 16].map((n) => (
                  <option key={n} value={n}>
                    {n} weeks
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Prepare for first-year university mechanics, with weekly problems"
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={composing || goal.trim().length < 8}>
              {composing ? "Compiling…" : "Compile syllabus"}
            </Button>
          </form>
        </aside>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
