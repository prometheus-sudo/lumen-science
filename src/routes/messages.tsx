import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  listMyMessages,
  listTeachers,
  sendTeacherMessage,
  type TeacherMessage,
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

function MessagesBody() {
  const user = useCurrentUser();
  const [teachers, setTeachers] = useState<{ userId: string; label: string }[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [body, setBody] = useState("");
  const [rows, setRows] = useState<TeacherMessage[]>([]);
  const [busy, setBusy] = useState(false);

  function refresh() {
    listMyMessages()
      .then(setRows)
      .catch(() => setRows([]));
  }

  useEffect(() => {
    listTeachers()
      .then((t) => {
        setTeachers(t);
        if (t[0]) setToUserId(t[0].userId);
      })
      .catch(() => setTeachers([]));
    refresh();
  }, []);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!toUserId || !body.trim()) return;
    setBusy(true);
    try {
      await sendTeacherMessage({ data: { toUserId, body } });
      setBody("");
      toast("Message sent");
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-2 text-sm text-muted">
          Students can write to teachers directly. Keep questions about science topics and lessons.
        </p>

        <form
          onSubmit={(e) => void onSend(e)}
          className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <label className="block text-sm">
            <span className="text-muted">To teacher</span>
            <select
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
            >
              {teachers.length === 0 ? (
                <option value="">No teachers listed yet</option>
              ) : (
                teachers.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.label}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Message</span>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ask about a topic or lesson…"
            />
          </label>
          <Button type="submit" disabled={busy || !toUserId || !body.trim()}>
            {busy ? "Sending…" : "Send"}
          </Button>
        </form>

        <section className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Recent</h2>
          <ul className="mt-3 space-y-3">
            {rows.length === 0 ? (
              <li className="text-sm text-muted">No messages yet.</li>
            ) : (
              rows.map((m) => (
                <li key={m.id} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
                  <p className="text-xs text-muted">
                    {m.from_user_id === user?.id ? "You → " : "→ You · from "}
                    {m.from_user_id === user?.id
                      ? m.to_user_id.slice(0, 8)
                      : m.from_user_id.slice(0, 8)}
                    {" · "}
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-fg">{m.body}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
