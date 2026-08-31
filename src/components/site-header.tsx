import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SiteMark } from "@/components/site-mark";
import { cn } from "@/lib/utils";

const links = [
  { to: "/explore", label: "Sciences" },
  { to: "/library", label: "Library" },
  { to: "/tutor", label: "Tutor" },
  { to: "/syllabus", label: "Syllabus" },
  { to: "/teach", label: "Teach" },
] as const;

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user, isPending } = useCurrentUserState();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border/80 backdrop-blur-md",
        solid ? "bg-bg/95" : "bg-bg/80",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-fg">
          <SiteMark className="size-6" />
          <span className="font-display text-lg tracking-tight">Lumen</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isPending ? null : user ? (
            <>
              <Link
                to="/account"
                className="hidden text-sm text-muted hover:text-fg sm:inline"
              >
                Account
              </Link>
              <UserButton />
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-bg"
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
    <footer className="border-t border-border py-8 text-center text-xs text-subtle">
      Lumen Science Academy — free science learning grounded in open research.
    </footer>
  );
}

export function MobileNav() {
  const links = [
    { to: "/explore", label: "Sciences" },
    { to: "/library", label: "Library" },
    { to: "/tutor", label: "Tutor" },
    { to: "/syllabus", label: "Syllabus" },
    { to: "/teach", label: "Teach" },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg/95 backdrop-blur-md sm:hidden">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="flex-1 py-3 text-center text-xs text-muted"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
