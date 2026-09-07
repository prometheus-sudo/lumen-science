import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { RichText } from "@/components/rich-text";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { listChat, sendChat, type ChatMessage } from "@/lib/server/chat";

export const Route = createFileRoute("/oracle")({ component: Oracle });

function Oracle() {
  return (
    <RequireAuth>
      <OracleBody />
    </RequireAuth>
  );
}

function OracleBody() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
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

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Oracle</h1>
        <p className="mt-2 text-sm text-muted">
          Science Q&amp;A adapted to your level and region. Oracle does not build syllabi and will
          not invent papers.
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
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
