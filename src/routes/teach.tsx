import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
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
import {
  factCheckTeacherLesson,
  integrateTeacherWithLongform,
  type FactCheckReport,
} from "@/lib/server/teacher-review";

export const Route = createFileRoute("/teach")({ component: TeachPage });

const emptyForm = {
  fieldSlug: "ecology",
  moduleName: "Teacher-added topics",
  conceptId: "",
  title: "",
  whyItMatters: "",
  body: "",
  minutes: 40,
  published: false,
};

function conceptIdFromTitle(title: string, explicit: string) {
  return (
    explicit.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48)
  );
}

function TeachPage() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mine, setMine] = useState<TeacherLessonRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [checkBusy, setCheckBusy] = useState(false);
  const [integrateBusy, setIntegrateBusy] = useState(false);
  const [report, setReport] = useState<FactCheckReport | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile().then(setProfile).catch(() => setProfile(null));
  }, [user]);

  useEffect(() => {
    if (!user || profile?.accountRole !== "teacher") return;
    listMyTeacherLessons().then(setMine).catch(() => setMine([]));
  }, [user, profile?.accountRole]);

  async function ensureDraftSaved(conceptId: string, published: boolean) {
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
        published,
      },
    });
  }

  async function onFactCheck() {
    const conceptId = conceptIdFromTitle(form.title, form.conceptId);
    if (!form.title.trim() || form.body.trim().length < 40) {
      toast("Title and a substantial body (40+ characters) are required");
      return;
    }
    setCheckBusy(true);
    setReport(null);
    try {
      await ensureDraftSaved(conceptId, false);
      const r = await factCheckTeacherLesson({
        data: {
          fieldSlug: form.fieldSlug,
          conceptId,
          title: form.title,
          body: form.body,
          whyItMatters: form.whyItMatters,
        },
      });
      setReport(r);
      setForm((f) => ({ ...f, conceptId }));
      toast(`Fact-check ${r.verdict.toUpperCase()} (score ${r.score})`);
      setMine(await listMyTeacherLessons());
    } catch (err) {
      toast(err instanceof Error ? err.message : "Fact-check failed");
    } finally {
      setCheckBusy(false);
    }
  }

  async function onIntegrate() {
    const conceptId = conceptIdFromTitle(form.title, form.conceptId);
    if (!report || report.verdict !== "pass") {
      toast("Integrate only after a PASS fact-check");
      return;
    }
    setIntegrateBusy(true);
    try {
      await ensureDraftSaved(conceptId, false);
      const out = await integrateTeacherWithLongform({
        data: {
          fieldSlug: form.fieldSlug,
          conceptId,
          title: form.title,
          body: form.body,
          whyItMatters: form.whyItMatters,
        },
      });
      toast(`Integrated (~${out.integratedWords.toLocaleString()} words)`);
      setMine(await listMyTeacherLessons());
    } catch (err) {
      toast(err instanceof Error ? err.message : "Integration failed");
    } finally {
      setIntegrateBusy(false);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const conceptId = conceptIdFromTitle(form.title, form.conceptId);
    if (form.published) {
      if (!report || report.verdict !== "pass") {
        toast("Run the fact-checker and get PASS before publishing");
        return;
      }
      if (profile?.teacherCredentialStatus !== "verified") {
        toast("Only verified teachers can publish");
        return;
      }
    }
    setBusy(true);
    try {
      await ensureDraftSaved(conceptId, form.published);
      toast(form.published ? "Lesson published" : "Draft saved");
      setMine(await listMyTeacherLessons());
      if (form.published) {
        setForm({ ...emptyForm, fieldSlug: form.fieldSlug });
        setReport(null);
      } else setForm((f) => ({ ...f, conceptId }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">Loading\u2026</div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold">Teach</h1>
          <p className="mt-3 text-sm text-muted">Sign in to submit credentials and publish.</p>
          <Link to="/login" className="mt-6 inline-block text-primary hover:underline">
            Sign in
          </Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (profile && profile.accountRole !== "teacher") {
    return (
      <TeacherCredentialGate
        busy={busy}
        setBusy={setBusy}
        onDone={(p) => {
          setProfile(p);
          toast("Credentials submitted");
        }}
      />
    );
  }

  if (profile?.teacherCredentialStatus === "rejected") {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-lg flex-1 px-4 py-16">
          <h1 className="text-2xl font-semibold">Teaching access revoked</h1>
          <p className="mt-3 text-sm text-muted">
            Credentials rejected. Publishing disabled; prior lessons removed.
          </p>
        </main>
        <MobileNav />
      </div>
    );
  }

  const canPublish =
    profile?.teacherCredentialStatus === "verified" && report?.verdict === "pass";

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Teach</h1>
        <p className="mt-2 text-sm text-muted">
          Status: <strong className="capitalize">{profile?.teacherCredentialStatus || "\u2026"}</strong>.
          Workflow: write \u2192 fact-check \u2192 integrate (on PASS) \u2192 publish when verified.
        </p>

        <form onSubmit={(e) => void onSave(e)} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-muted">Science field</span>
            <select
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={form.fieldSlug}
              onChange={(e) => setForm({ ...form, fieldSlug: e.target.value })}
            >
              {FIELDS.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
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
          <label className="block text-sm">
            <span className="text-muted">Title</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Concept id (optional)</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs"
              value={form.conceptId}
              onChange={(e) => setForm({ ...form, conceptId: e.target.value })}
              placeholder="eco-food"
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
            <span className="text-muted">Lesson body</span>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
              rows={12}
              value={form.body}
              onChange={(e) => {
                setForm({ ...form, body: e.target.value });
                setReport(null);
              }}
              required
            />
          </label>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" disabled={checkBusy} onClick={() => void onFactCheck()}>
              {checkBusy ? "Checking\u2026" : "1 \u00b7 Run fact-checker"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={integrateBusy || report?.verdict !== "pass"}
              onClick={() => void onIntegrate()}
            >
              {integrateBusy ? "Integrating\u2026" : "2 \u00b7 Integrate with academy lesson"}
            </Button>
          </div>

          {report ? (
            <div
              className={
                "rounded-lg border p-4 text-sm " +
                (report.verdict === "pass"
                  ? "border-green-700/40 bg-green-50 dark:bg-green-950/20"
                  : report.verdict === "fail"
                    ? "border-red-700/40 bg-red-50 dark:bg-red-950/20"
                    : "border-amber-700/40 bg-amber-50 dark:bg-amber-950/20")
              }
            >
              <p className="font-semibold uppercase tracking-wide">
                Verdict: {report.verdict} \u00b7 score {report.score}/100
              </p>
              <p className="mt-2 text-muted">{report.summary}</p>
              {report.strengths.length > 0 ? (
                <ul className="mt-2 list-disc pl-5">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : null}
              {report.issues.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {report.issues.map((iss, i) => (
                    <li key={i} className="rounded border border-border/60 p-2">
                      <span className="text-xs font-semibold uppercase">{iss.severity}</span>
                      <p className="font-medium">{iss.claim}</p>
                      <p className="text-muted">{iss.explanation}</p>
                      {iss.suggestion ? (
                        <p className="text-xs text-subtle">Fix: {iss.suggestion}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              disabled={!canPublish && !form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publish (verified credentials + fact-check PASS)
          </label>

          <Button type="submit" disabled={busy}>
            {busy ? "Saving\u2026" : form.published ? "3 \u00b7 Publish" : "Save draft"}
          </Button>
        </form>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase text-muted">Your lessons</h2>
          <ul className="mt-3 space-y-2">
            {mine.length === 0 ? (
              <li className="text-sm text-muted">No submissions yet.</li>
            ) : (
              mine.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {row.title}{" "}
                    <span className="text-xs text-muted">
                      {row.field_slug}/{row.concept_id} \u00b7{" "}
                      {row.published ? "published" : "draft"}
                      {row.fact_check_status ? ` \u00b7 check:${row.fact_check_status}` : ""}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      deleteTeacherLesson({ data: { id: row.id } })
                        .then(async () => {
                          toast("Deleted");
                          setMine(await listMyTeacherLessons());
                        })
                        .catch((e) => toast(e instanceof Error ? e.message : "Delete failed"))
                    }
                  >
                    Delete
                  </Button>
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
        <p className="mt-3 text-sm text-muted">Institution and qualification required.</p>
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
            <span className="text-muted">Qualification</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Notes</span>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <Button className="w-full" disabled={busy} onClick={() => void submit()}>
            {busy ? "Submitting\u2026" : "Submit credentials"}
          </Button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
