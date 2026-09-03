import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { redeemStaffInvite } from "@/lib/server/staff";

export const Route = createFileRoute("/staff-invite/$token")({
  component: StaffInvitePage,
});

function StaffInvitePage() {
  return (
    <RequireAuth>
      <RedeemBody />
    </RequireAuth>
  );
}

function RedeemBody() {
  const { token } = Route.useParams();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader solid />
      <main className="mx-auto max-w-md flex-1 px-4 py-12">
        <h1 className="text-2xl font-semibold">Staff invite</h1>
        <p className="mt-2 text-sm text-muted">
          This one-use link grants moderator or admin tools on your existing Lumen account.
        </p>
        {done ? (
          <p className="mt-6 text-sm">
            Done. Open{" "}
            <Link to="/moderate" className="text-primary hover:underline">
              Moderator
            </Link>{" "}
            or{" "}
            <Link to="/admin" className="text-primary hover:underline">
              Admin
            </Link>
            .
          </p>
        ) : (
          <Button
            className="mt-6"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              redeemStaffInvite({ data: { token } })
                .then(() => {
                  setDone(true);
                  toast("Staff access granted");
                })
                .catch((e) => toast(e instanceof Error ? e.message : "Invite failed"))
                .finally(() => setBusy(false));
            }}
          >
            {busy ? "Redeeming\u2026" : "Redeem one-use invite"}
          </Button>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
