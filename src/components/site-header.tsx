import { Link } from "@tanstack/react-router";
import { UserButton } from "@/components/user-button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const links = [
  { to: "/explore", label: "Sciences" },
  { to: "/library", label: "Library" },
  { to: "/oracle", label: "Oracle" },
  { to: "/syllabus", label: "Syllabus" },
  { to: "/teach", label: "Teach" },
] as const;

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user, isPending } = useCurrentUserState();

  return (
    <header
      className={
        solid
          ? "sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-md"
          : "absolute inset-x-0 top-0 z-20"
      }
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-medium tracking-tight text-fg">
          <span className="inline-flex size-7 items-center justify-center rounded-full border border-border text-xs">
            L
          </span>
          <span className="font-display text-lg tracking-tight">Lumen</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-sm px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex min-h-8 min-w-24 items-center justify-end">
          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-fg/8" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/account"
                className="hidden text-sm text-muted hover:text-fg sm:inline"
              >
                Account
              </Link>
              <div className="max-w-[14rem] truncate text-fg [&_span.text-sm]:hidden sm:[&_span.text-sm]:inline">
                <UserButton />
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-sm bg-primary px-3 text-sm font-medium text-primary-fg"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Lumen is free. Lessons cite established research. Nothing is paywalled.</p>
        <p className="text-subtle">Open literature · Oracle</p>
      </div>
    </footer>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="grid grid-cols-4">
        {[
          { to: "/explore" as const, label: "Sciences" },
          { to: "/oracle" as const, label: "Oracle" },
          { to: "/syllabus" as const, label: "Syllabus" },
          { to: "/account" as const, label: "Account" },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex h-12 items-center justify-center text-xs font-medium text-muted hover:text-fg"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
