import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { LANGUAGES, LEARNING_LEVELS, REGIONS } from "@/lib/learner";
import { getProfile, saveProfile, setUsername } from "@/lib/server/profile";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  return (
    <RequireAuth>
      <AccountForm />
    </RequireAuth>
  );
}

function AccountForm() {
  const user = useCurrentUser();
  const [level, setLevel] = useState("student");
  const [region, setRegion] = useState("north-america");
  const [language, setLanguage] = useState("en");
  const [busy, setBusy] = useState(false);
  const [username, setUsernameField] = useState("");
  const [usernameBusy, setUsernameBusy] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setLevel(p.learningLevel);
        setRegion(p.region);
        setLanguage(p.languagePref);
        setUsernameField(p.username ?? "");
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveProfile({
        data: { learningLevel: level, region, languagePref: language },
      });
      toast("Preferences saved");
    } catch {
      toast("Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-muted">
          {user?.displayName ?? user?.primaryEmail ?? "Signed in"} · Lumen is free.
        </p>
        <div className="mt-6">
          <UserButton />
        </div>

        <div className="mt-10 space-y-3 rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Username</h2>
          <p className="text-xs text-muted">
            Public handle for messages. Must be unique (letters, numbers, underscore).
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm"
              value={username}
              onChange={(e) => setUsernameField(e.target.value)}
              placeholder="your_name"
            />
            <Button
              type="button"
              disabled={usernameBusy}
              onClick={() => {
                setUsernameBusy(true);
                setUsername({ data: { username } })
                  .then(() => toast("Username saved"))
                  .catch((err) =>
                    toast(err instanceof Error ? err.message : "Could not set username"),
                  )
                  .finally(() => setUsernameBusy(false));
              }}
            >
              {usernameBusy ? "…" : "Save"}
            </Button>
          </div>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="level">Learning level</Label>
            <Select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEARNING_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label} — {l.ages}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language preference</Label>
            <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save preferences"}
          </Button>
        </form>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
