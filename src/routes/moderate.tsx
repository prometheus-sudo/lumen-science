import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getStaffSession, listOpenReports, resolveReport } from "@/lib/server/staff";

export const Route = createFileRoute("/moderate")({ component: ModeratePage });

function ModeratePage() {
  return (
    <RequireAuth>
      <ModerateBody />
    </RequireAuth>
  );
}

function ModerateBody() {
  const [role, setRole] = useState("none");
  const [fields, setFields] = useState<string[]>([]);
  const [reports, setReports] = useState<
    { id: number; field_slug: string; concept_id: string; reason: string; created_at: string }[]
  >([]);

  function refresh() {
    getStaffSession()
      .then((s) => {
        setRole(s.staffRole);
        setFields(s.moderatorFields);
      })
      .catch(() => setRole("none"));
    listOpenReports()
      .then(setReports)
      .catch(() => setReports([]));
  }

  useEffect(() => {
    refresh();
  }, []);

  if (role !== "moderator" && role !== "admin") {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-lg flex-1 px-4 py-12">
          <h1 className="text-2xl font-semibold">Moderator</h1>
          <p className="mt-2 text-sm text-muted">
            Access is only via a one-use invite link from an admin. Moderators are normal teacher
            accounts who also review invalid-information reports in their assigned fields.
          </p>
          <Link to="/admin" className="mt-4 inline-block text-sm text-primary hover:underline">
            Admin
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Moderator</h1>
        <p className="mt-2 text-sm text-muted">
          Your fields: {fields.length ? fields.join(", ") : "all (admin)"}. Open reports of wrong
          teacher content appear here.
        </p>
        <ul className="mt-8 space-y-3">
          {reports.length === 0 ? (
            <li className="text-sm text-muted">No open reports in your fields.</li>
          ) : (
            reports.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-4 text-sm">
                <p className="font-medium">
                  {r.field_slug} / {r.concept_id}
                </p>
                <p className="mt-1 text-muted">{r.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      resolveReport({
                        data: { reportId: r.id, action: "remove_content", unpublishLesson: true },
                      })
                        .then(() => {
                          toast("Lesson unpublished");
                          refresh();
                        })
                        .catch((e) => toast(e instanceof Error ? e.message : "Failed"))
                    }
                  >
                    Remove wrong content
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
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
