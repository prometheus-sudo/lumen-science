import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LANGUAGES, LEARNING_LEVELS, REGIONS } from "@/lib/learner";
import { getProfile, saveProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  return (
    <RequireAuth>
      <OnboardingForm />
    </RequireAuth>
  );
}

function OnboardingForm() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [level, setLevel] = useState("student");
  const [region, setRegion] = useState("north-america");
  const [language, setLanguage] = useState("en");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setRole(p.accountRole === "teacher" ? "teacher" : "student");
        setLevel(p.learningLevel);
        setRegion(p.region);
        setLanguage(p.languagePref);
        if (p.onboardingComplete) {
          void navigate({ to: "/explore" });
        }
      })
      .catch(() => undefined);
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await saveProfile({
        data: {
          learningLevel: role === "teacher" ? level || "student" : level,
          region,
          languagePref: language,
        },
      });
      await navigate({ to: role === "teacher" ? "/teach" : "/explore" });
    } catch {
      setError("Could not save your preferences.");
    } finally {
      setBusy(false);
    }
  }

  const isTeacher = role === "teacher";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">First step</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {isTeacher ? "Set up your teaching profile" : "How should Lumen write?"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {isTeacher
            ? "Choose region and language for your account. Learning level is only for student accounts."
            : "Lessons and Oracle match this level, use examples from your region, and reply in your language. You can change it later."}
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
          {!isTeacher ? (
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
          ) : null}
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
            <Label htmlFor="language">Language</Label>
            <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Saving\u2026" : isTeacher ? "Start teaching" : "Start learning"}
          </Button>
        </form>
      </main>
    </div>
  );
}
