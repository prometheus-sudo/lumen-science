import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { FIELD_SLUGS } from "@/lib/sciences-types";
import { FIELDS } from "@/lib/sciences";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getProfile,
  submitTeacherCredentials,
  type Profile,
} from "@/lib/server/profile";
import {
  deleteTeacherLesson,
  listMyTeacherLessons,
  saveTeacherLesson,
  type TeacherLessonRow,
} from "@/lib/server/teacher-lessons";

export const Route = createFileRoute("/teach")({
  component: TeachPage,
});

const emptyForm = {
  fieldSlug: "ecology",
  moduleName: "Teacher-added topics",
  conceptId: "",
  title: "",
  whyItMatters: "",
  body: "",
  minutes: 40,
  published: true,
};

function TeachPage() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mine, setMine] = useState<TeacherLessonRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [user]);

  useEffect(() => {
    if (!user || profile?.accountRole !== "teacher") return;
    listMyTeacherLessons()
      .then(setMine)
      .catch(() => setMine([]));
  }, [user, profile?.accountRole]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const conceptId =
        form.conceptId.trim() ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 48);
      await saveTeacherLesson({
        data: {
          fieldSlug: form.fieldSlug,
          moduleName: form.moduleName,
          conceptId,
          title: form.title,
          whyItMatters: form.whyItMatters,
          body: form.body,
          keyIdeas: [],
          objectives: [],
          terms: [],
          checkQuestions: [],
          pitfalls: [],
          minutes: form.minutes,
          published: form.published,
        },
      });
      toast("Subtopic published");
      const rows = await listMyTeacherLessons();
      setMine(rows);
      setForm({ ...emptyForm, fieldSlug: form.fieldSlug });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-muted">Loading…</main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold">Teach on Lumen</h1>
          <p className="mt-3 text-sm text-muted">Sign in to submit credentials and publish subtopics.</p>
          <Button asChild className="mt-6">
            <Link to="/login">Sign in</Link>
          </Button>
        </main>
      </div>
    );
  }

  if (profile?.accountRole !== "teacher") {
    return (
      <TeacherCredentialGate
        busy={busy}
        setBusy={setBusy}
        onDone={(p) => {
          setProfile(p);
          toast("Credentials submitted. You can publish subtopics.");
        }}
      />
    );
  }

  if (profile.teacherCredentialStatus === "rejected") {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold">Credentials not accepted</h1>
          <p className="mt-3 text-sm text-muted">Contact administrators if this is an error.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Teach</h1>
        <p className="mt-3 text-sm text-muted">
          Add a <strong>new subtopic</strong> to any science. Published items appear on that subject
          page.
        </p>

        <form onSubmit={(e) => void onSave(e)} className="mt-10 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted">Subject</span>
              <select
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
                value={form.fieldSlug}
                onChange={(e) => setForm({ ...form, fieldSlug: e.target.value })}
              >
                {FIELD_SLUGS.map((s) => (
                  <option key={s} value={s}>
                    {FIELDS.find((f) => f.slug === s)?.name ?? s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-muted">Module</span>
              <input
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
                value={form.moduleName}
                onChange={(e) => setForm({ ...form, moduleName: e.target.value })}
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-muted">Title</span>
            <input
              required
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Subtopic id (optional)</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={form.conceptId}
              onChange={(e) => setForm({ ...form, conceptId: e.target.value })}
              placeholder="auto from title"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Why it matters</span>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              rows={2}
              value={form.whyItMatters}
              onChange={(e) => setForm({ ...form, whyItMatters: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Full lesson body</span>
            <textarea
              required
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              rows={12}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Publish subtopic"}
          </Button>
        </form>

        <section className="mt-12">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Your subtopics</h2>
          <ul className="mt-3 space-y-2">
            {mine.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span>
                  {r.title} · {r.field_slug}/{r.concept_id}
                </span>
                <button
                  type="button"
                  className="text-muted hover:text-fg"
                  onClick={() => {
                    if (!confirm("Delete?")) return;
                    deleteTeacherLesson({ data: { id: r.id } })
                      .then(() => setMine((m) => m.filter((x) => x.id !== r.id)))
                      .catch(() => toast("Could not delete"));
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}

function TeacherCredentialGate({
  busy,
  setBusy,
  onDone,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  onDone: (p: Profile) => void;
}) {
  const [institution, setInstitution] = useState("");
  const [qualification, setQualification] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    setBusy(true);
    try {
      const p = await submitTeacherCredentials({
        data: { institution, qualification, note },
      });
      onDone(p);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not submit credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader solid />
      <main className="mx-auto max-w-lg flex-1 px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Verify teaching credentials</h1>
        <p className="mt-3 text-sm text-muted">
          Institution and qualification are required before you can publish subtopics.
        </p>
        <div className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-muted">Institution</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Qualification / licence</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Notes (optional)</span>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <Button className="w-full" disabled={busy} onClick={() => void submit()}>
            {busy ? "Submitting…" : "Submit credentials and open Teach"}
          </Button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
