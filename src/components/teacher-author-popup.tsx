import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { sendTeacherMessage } from "@/lib/server/messages";
import type { TeacherPublicCard } from "@/lib/server/teacher-public";

export function TeacherAuthorByline({
  author,
  fieldSlug,
  conceptId,
}: {
  author: TeacherPublicCard;
  fieldSlug?: string;
  conceptId?: string;
}) {
  const [open, setOpen] = useState(false);
  const handle = author.username ? `@${author.username}` : "Teacher";

  return (
    <>
      <p className="mt-8 border-t border-border pt-6 text-sm text-muted">
        Written by{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {handle}
        </button>
      </p>
      {open ? (
        <TeacherProfileModal
          author={author}
          fieldSlug={fieldSlug}
          conceptId={conceptId}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function TeacherProfileModal({
  author,
  fieldSlug,
  conceptId,
  onClose,
}: {
  author: TeacherPublicCard;
  fieldSlug?: string;
  conceptId?: string;
  onClose: () => void;
}) {
  const user = useCurrentUser();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const handle = author.username ? `@${author.username}` : null;

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!handle) {
      toast("This teacher has not set a username yet");
      return;
    }
    if (!user) {
      toast("Sign in to message teachers");
      return;
    }
    setBusy(true);
    try {
      await sendTeacherMessage({
        data: {
          toUsername: author.username!,
          body,
          fieldSlug,
          conceptId,
        },
      });
      setBody("");
      toast(`Message sent to ${handle}`);
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-profile-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="teacher-profile-title" className="text-lg font-semibold text-fg">
              {handle ?? "Teacher"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              Credentials shown for transparency. Message by username only.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-fg">
            Close
          </button>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Username</dt>
            <dd className="font-medium text-fg">{handle ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Institution</dt>
            <dd className="text-fg">{author.institution || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Qualification</dt>
            <dd className="text-fg">{author.qualification || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Credential status</dt>
            <dd className="capitalize text-fg">{author.credentialStatus || "none"}</dd>
          </div>
        </dl>

        {user ? (
          <form
            onSubmit={(e) => void onSend(e)}
            className="mt-5 space-y-3 border-t border-border pt-4"
          >
            <label className="block text-sm">
              <span className="text-muted">Message {handle ?? "teacher"}</span>
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ask about this lesson\u2026"
                required
              />
            </label>
            <Button type="submit" disabled={busy || !body.trim() || !handle}>
              {busy ? "Sending\u2026" : handle ? `Send to ${handle}` : "Username required"}
            </Button>
          </form>
        ) : (
          <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to message this teacher.
          </p>
        )}
      </div>
    </div>
  );
}
