import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SiteMark } from "@/components/site-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { to: "/explore", label: "Sciences" },
  { to: "/library", label: "Library" },
  { to: "/teach", label: "Teach" },
] as const;

const ACCOUNT_TOOLS = [
  { to: "/oracle", label: "Oracle" },
  { to: "/syllabus", label: "Syllabi" },
  { to: "/messages", label: "Messages" },
] as const;

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  const showToolsInHeader = !isPending && !user;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border/80 backdrop-blur-md",
        solid ? "bg-bg/95" : "bg-bg/80",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 md:h-[4.25rem]">
        <Link to="/" className="flex items-center gap-2.5 text-fg">
          <SiteMark className="size-8" />
          <span className="font-display text-2xl tracking-tight sm:text-3xl">Lumen</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-sm px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          {showToolsInHeader
            ? ACCOUNT_TOOLS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-sm px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
                >
                  {l.label}
                </Link>
              ))
            : null}
        </nav>
        <div className="flex min-h-8 min-w-24 items-center justify-end gap-1">
          <ThemeToggle />
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
  const { user, isPending } = useCurrentUserState();
  const items = [
    { to: "/explore" as const, label: "Sciences" },
    ...(isPending || user
      ? []
      : [
          { to: "/oracle" as const, label: "Oracle" },
          { to: "/syllabus" as const, label: "Syllabi" },
        ]),
    ...(user
      ? [
          { to: "/oracle" as const, label: "Oracle" },
          { to: "/messages" as const, label: "Messages" },
          { to: "/account" as const, label: "Account" },
        ]
      : [{ to: "/login" as const, label: "Sign in" }]),
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, minmax(0, 1fr))` }}
      >
        {items.map((l) => (
          <Link
            key={l.to + l.label}
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
