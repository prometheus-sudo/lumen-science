import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  adminListUsers,
  adminRemoveUserContent,
  bootstrapAdmin,
  createStaffInvite,
  getStaffSession,
  listOpenReports,
  listPendingTeachers,
  rejectTeacher,
  resolveReport,
  verifyTeacher,
} from "@/lib/server/staff";
import { FIELD_SLUGS } from "@/lib/sciences-types";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <RequireAuth>
      <AdminBody />
    </RequireAuth>
  );
}

function AdminBody() {
  const [role, setRole] = useState<string>("none");
  const [pending, setPending] = useState<
    {
      user_id: string;
      username: string | null;
      teacher_institution: string | null;
      teacher_qualification: string | null;
      teacher_credential_note: string | null;
    }[]
  >([]);
  const [reports, setReports] = useState<
    { id: number; field_slug: string; concept_id: string; reason: string; created_at: string }[]
  >([]);
  const [users, setUsers] = useState<
    {
      user_id: string;
      username: string | null;
      account_role: string | null;
      staff_role: string | null;
      teacher_credential_status: string | null;
    }[]
  >([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"moderator" | "admin">("moderator");
  const [inviteFields, setInviteFields] = useState<string[]>(["ecology"]);
  const [inviteUrl, setInviteUrl] = useState("");
  const [bootKey, setBootKey] = useState("");

  function refresh() {
    getStaffSession()
      .then((s) => setRole(s.staffRole))
      .catch(() => setRole("none"));
    listPendingTeachers()
      .then(setPending)
      .catch(() => setPending([]));
    listOpenReports()
      .then(setReports)
      .catch(() => setReports([]));
    adminListUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }

  useEffect(() => {
    refresh();
  }, []);

  if (role !== "admin") {
    return (
      <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
        <SiteHeader solid />
        <main className="mx-auto max-w-lg flex-1 px-4 py-12">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-2 text-sm text-muted">
            Admin access is granted only via a one-use invite link, or a one-time bootstrap key.
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              bootstrapAdmin({ data: { key: bootKey } })
                .then(() => {
                  toast("You are now admin");
                  refresh();
                })
                .catch((err) => toast(err instanceof Error ? err.message : "Bootstrap failed"));
            }}
          >
            <label className="block text-sm">
              Bootstrap key (env LUMEN_ADMIN_BOOTSTRAP_KEY)
              <input
                className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                value={bootKey}
                onChange={(e) => setBootKey(e.target.value)}
                type="password"
              />
            </label>
            <Button type="submit">Claim admin (first time only)</Button>
          </form>
          <p className="mt-4 text-sm">
            <Link to="/moderate" className="text-primary hover:underline">
              Moderator console
            </Link>
          </p>
        </main>
        <SiteFooter />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Verify teachers, issue one-use staff invites, resolve reports, remove users.
          </p>
        </div>

        <section className="rounded-lg border border-border p-4">
          <h2 className="font-semibold">One-use staff invite</h2>
          <p className="mt-1 text-xs text-muted">
            Create a link and email it yourself. The recipient signs in to Lumen, opens the link once,
            and becomes moderator or admin.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              createStaffInvite({
                data: {
                  email: inviteEmail,
                  staffRole: inviteRole,
                  moderatorFields: inviteRole === "moderator" ? inviteFields : [],
                },
              })
                .then((r) => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  setInviteUrl(`${origin}${r.path}`);
                  toast("Invite created \u2014 send the link by email");
                })
                .catch((err) => toast(err instanceof Error ? err.message : "Failed"));
            }}
          >
            <input
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
              placeholder="email@school.edu"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "moderator" | "admin")}
            >
              <option value="moderator">Moderator (field reports)</option>
              <option value="admin">Admin (full control)</option>
            </select>
            {inviteRole === "moderator" ? (
              <select
                multiple
                className="h-28 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
                value={inviteFields}
                onChange={(e) =>
                  setInviteFields(Array.from(e.target.selectedOptions).map((o) => o.value))
                }
              >
                {FIELD_SLUGS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : null}
            <Button type="submit">Create invite link</Button>
          </form>
          {inviteUrl ? (
            <p className="mt-3 break-all rounded-md bg-bg p-2 text-xs text-fg">{inviteUrl}</p>
          ) : null}
        </section>

        <section>
          <h2 className="font-semibold">Pending teacher credentials</h2>
          <ul className="mt-3 space-y-3">
            {pending.length === 0 ? (
              <li className="text-sm text-muted">None pending.</li>
            ) : (
              pending.map((p) => (
                <li key={p.user_id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium">@{p.username || p.user_id.slice(0, 8)}</p>
                  <p className="text-muted">{p.teacher_institution}</p>
                  <p className="text-muted">{p.teacher_qualification}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        verifyTeacher({ data: { userId: p.user_id } })
                          .then(() => {
                            toast("Verified");
                            refresh();
                          })
                          .catch((e) => toast(e instanceof Error ? e.message : "Failed"))
                      }
                    >
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        rejectTeacher({
                          data: {
                            userId: p.user_id,
                            note: "Credentials could not be confirmed",
                          },
                        })
                          .then(() => {
                            toast("Rejected \u2014 lessons removed");
                            refresh();
                          })
                          .catch((e) => toast(e instanceof Error ? e.message : "Failed"))
                      }
                    >
                      Reject & remove lessons
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">Open reports</h2>
          <ul className="mt-3 space-y-3">
            {reports.length === 0 ? (
              <li className="text-sm text-muted">No open reports.</li>
            ) : (
              reports.map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium">
                    {r.field_slug}/{r.concept_id}
                  </p>
                  <p className="text-muted">{r.reason}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        resolveReport({
                          data: { reportId: r.id, action: "remove_content", unpublishLesson: true },
                        })
                          .then(() => {
                            toast("Content unpublished");
                            refresh();
                          })
                          .catch((e) => toast(e instanceof Error ? e.message : "Failed"))
                      }
                    >
                      Remove lesson
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        resolveReport({ data: { reportId: r.id, action: "dismiss" } })
                          .then(() => {
                            toast("Dismissed");
                            refresh();
                          })
                          .catch((e) => toast(e instanceof Error ? e.message : "Failed"))
                      }
                    >
                      Dismiss
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">Users</h2>
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
            {users.map((u) => (
              <li
                key={u.user_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2"
              >
                <span>
                  @{u.username || u.user_id.slice(0, 8)} \u00b7 {u.account_role} \u00b7 staff:
                  {u.staff_role} \u00b7 cred:{u.teacher_credential_status}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    adminRemoveUserContent({ data: { userId: u.user_id } })
                      .then(() => {
                        toast("User demoted, lessons deleted");
                        refresh();
                      })
                      .catch((e) => toast(e instanceof Error ? e.message : "Failed"))
                  }
                >
                  Remove teaching rights
                </Button>
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
