import { useEffect, useState, type ReactNode } from "react";
import { AvatarDisplay } from "@/components/avatar-display";
import { Navigate } from "@tanstack/react-router";
import { authEnabled, signOut } from "./client";
import { useCurrentUser, useCurrentUserState } from "./use-current-user";

export const SIGN_IN_PATH = "/login";

export function SignedIn({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  return user ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending || user) return null;
  return <>{children}</>;
}

export function RedirectToSignIn({ to = SIGN_IN_PATH }: { to?: string }) {
  return <Navigate to={to} />;
}

export function UserButton() {
  const user = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  useEffect(() => {
    try {
      setAvatarKey(localStorage.getItem("lumen-avatar-key"));
    } catch {
      setAvatarKey(null);
    }
  }, [user?.id]);
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? "Account";
  return (
    <div className="flex items-center gap-2">
      <AvatarDisplay
        avatarKey={avatarKey}
        imageUrl={user.profileImageUrl}
        label={label}
        size={32}
      />
      <span className="text-sm font-medium">{label}</span>
      {authEnabled && (
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut().catch(() => setSigningOut(false));
          }}
          className="cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline"
        >
          {signingOut ? "Signing out\u2026" : "Sign out"}
        </button>
      )}
    </div>
  );
}
