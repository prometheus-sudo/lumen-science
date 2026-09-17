import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  listDirectoryUsers,
  listMyMessages,
  sendTeacherMessage,
  type ChatMessage,
} from "@/lib/server/messages";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/messages")({ component: MessagesPage });

function MessagesPage() {
  return (
    <RequireAuth>
      <MessagesBody />
    </RequireAuth>
  );
}

type DirectoryUser = { userId: string; username: string; label: string; role?: string };

function MessagesBody() {
  const user = useCurrentUser();
  const myId = user?.id ?? "";
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [rows, setRows] = useState<ChatMessage[]>([]);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [composeTo, setComposeTo] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function refresh() {
    return Promise.all([
      listDirectoryUsers().catch(() => [] as DirectoryUser[]),
      listMyMessages().catch(() => [] as ChatMessage[]),
    ]).then(([d, m]) => {
      setDirectory(d);
      setRows(m);
    });
  }

  useEffect(() => {
    void refresh();
    const t = window.setInterval(() => void refresh(), 12000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeUsername, rows]);

  const threads = useMemo(() => {
    const map = new Map<
      string,
      { username: string; userId: string; last: ChatMessage; unreadHint: number }
    >();
    for (const m of rows) {
      const otherId = m.from_user_id === myId ? m.to_user_id : m.from_user_id;
      const otherName =
        m.from_user_id === myId
          ? m.to_username || otherId.slice(0, 8)
          : m.from_username || otherId.slice(0, 8);
      const prev = map.get(otherId);
      if (!prev || new Date(m.created_at) > new Date(prev.last.created_at)) {
        map.set(otherId, { username: otherName, userId: otherId, last: m, unreadHint: 0 });
      }
    }
    return [...map.values()].sort(
      (a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime(),
    );
  }, [rows, myId]);

  const activeThread = useMemo(() => {
    if (!activeUsername) return [];
    const un = activeUsername.toLowerCase();
    return rows.filter((m) => {
      const from = (m.from_username || "").toLowerCase();
      const to = (m.to_username || "").toLowerCase();
      return from === un || to === un;
    });
  }, [rows, activeUsername]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const to = (activeUsername || composeTo).trim().replace(/^@/, "");
    if (!to || !body.trim()) return;
    setBusy(true);
    try {
      await sendTeacherMessage({ data: { toUsername: to, body: body.trim() } });
      setBody("");
      setActiveUsername(to);
      setComposeTo("");
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-0 border-x border-border md:grid-cols-[280px_1fr]">
        <aside className="flex flex-col border-b border-border bg-surface md:border-b-0 md:border-r">
          <div className="border-b border-border px-4 py-3">
            <h1 className="font-display text-xl tracking-tight">Messages</h1>
            <p className="mt-0.5 text-xs text-muted">Chat with any Lumen @username</p>
            <div className="mt-3 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-full border border-border bg-bg px-3 py-1.5 text-sm"
                placeholder="New chat @username"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value.replace(/^@/, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const u = composeTo.trim().replace(/^@/, "");
                    if (u) {
                      setActiveUsername(u);
                      setComposeTo("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 rounded-full"
                onClick={() => {
                  const u = composeTo.trim().replace(/^@/, "");
                  if (u) {
                    setActiveUsername(u);
                    setComposeTo("");
                  }
                }}
              >
                Open
              </Button>
            </div>
          </div>
          <ul className="max-h-[40vh] flex-1 overflow-y-auto md:max-h-none">
            {threads.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted">No conversations yet.</li>
            ) : (
              threads.map((t) => (
                <li key={t.userId}>
                  <button
                    type="button"
                    className={
                      "flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition hover:bg-bg " +
                      (activeUsername?.toLowerCase() === t.username.toLowerCase() ? "bg-bg" : "")
                    }
                    onClick={() => setActiveUsername(t.username)}
                  >
                    <span className="text-sm font-medium">@{t.username}</span>
                    <span className="line-clamp-1 text-xs text-muted">{t.last.body}</span>
                  </button>
                </li>
              ))
            )}
            {directory.length > 0 && threads.length === 0 ? (
              <li className="border-t border-border px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  People on Lumen
                </p>
                <ul className="mt-2 space-y-1">
                  {directory.slice(0, 12).map((d) => (
                    <li key={d.userId}>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => setActiveUsername(d.username)}
                      >
                        {d.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
        </aside>

        <section className="flex min-h-[50vh] flex-col bg-bg">
          {!activeUsername ? (
            <div className="grid flex-1 place-items-center px-6 text-center text-sm text-muted">
              Select a conversation or start a new chat with an @username.
            </div>
          ) : (
            <>
              <header className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="grid size-9 place-items-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-100">
                  {(activeUsername[0] || "?").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">@{activeUsername}</p>
                  <p className="text-[11px] text-muted">Lumen message</p>
                </div>
              </header>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {activeThread.length === 0 ? (
                  <p className="text-center text-sm text-muted">Say hello — no messages yet.</p>
                ) : (
                  activeThread.map((m) => {
                    const mine = m.from_user_id === myId;
                    return (
                      <div
                        key={m.id}
                        className={"flex " + (mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={
                            "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed " +
                            (mine
                              ? "rounded-br-md bg-emerald-700 text-white"
                              : "rounded-bl-md bg-surface text-fg ring-1 ring-border")
                          }
                        >
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p
                            className={
                              "mt-1 text-[10px] " + (mine ? "text-emerald-100/80" : "text-muted")
                            }
                          >
                            {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
              <form
                onSubmit={(e) => void onSend(e)}
                className="flex gap-2 border-t border-border bg-surface px-3 py-3"
              >
                <input
                  className="min-w-0 flex-1 rounded-full border border-border bg-bg px-4 py-2 text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type a message"
                  autoComplete="off"
                />
                <Button type="submit" disabled={busy || !body.trim()} className="rounded-full px-5">
                  {busy ? "\u2026" : "Send"}
                </Button>
              </form>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
