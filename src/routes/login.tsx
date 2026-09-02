import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient, authEnabled } from "@/lib/auth/client";
import { SiteMark } from "@/components/site-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ component: Login });

type Mode = "signin" | "signup";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authEnabled) {
      toast.error("Sign-in is disabled in this environment.");
      return;
    }
    const em = email.trim().toLowerCase();
    if (!em || password.length < 8) {
      toast.error("Use a valid email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email: em,
          password,
          name: name.trim() || em.split("@")[0] || "Learner",
        });
        if (res.error) {
          toast.error(res.error.message || "Could not create account.");
          return;
        }
        toast.success("Account created. Welcome to Lumen.");
      } else {
        const res = await authClient.signIn.email({
          email: em,
          password,
        });
        if (res.error) {
          toast.error(res.error.message || "Could not sign in.");
          return;
        }
        toast.success("Signed in.");
      }
      void navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-[0_1px_0_color-mix(in_oklab,var(--color-fg)_6%,transparent)]">
        <Link to="/" className="mb-8 flex items-center gap-2 text-fg">
          <SiteMark />
          <span className="font-display text-xl tracking-tight">Lumen</span>
        </Link>
        <h1 className="font-display text-3xl tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Free Lumen accounts only. Your syllabus, Oracle chats, and reading level stay on this
          site — this is not a Grok or xAI login.
        </p>

        {!authEnabled ? (
          <p className="mt-8 text-sm text-muted">
            Sign-in is disabled (<code className="text-xs">VITE_AUTH_ENABLED=false</code>). Remove
            that flag to use real accounts.
          </p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <label className="block text-sm">
                <span className="text-muted">Display name</span>
                <Input
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            ) : null}
            <label className="block text-sm">
              <span className="text-muted">Email</span>
              <Input
                className="mt-1"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Password (min 8 characters)</span>
              <Input
                className="mt-1"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in to Lumen"
                  : "Create Lumen account"}
            </Button>
          </form>
        )}

        {authEnabled ? (
          <p className="mt-6 text-center text-sm text-muted">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        ) : null}

        <p className="mt-8 text-xs leading-relaxed text-subtle">
          Accounts are stored for this Lumen app only. Google/X via the Grok broker are not used on
          this login page.
        </p>
      </div>
    </main>
  );
}
