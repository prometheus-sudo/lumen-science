import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, MessageSquare, Sparkles } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    to: "/oracle" as const,
    label: "Oracle",
    hint: "Tutor \u00b7 syllabi \u00b7 Q&A",
    icon: Sparkles,
  },
  {
    to: "/syllabus" as const,
    label: "Syllabi",
    hint: "Your study plans",
    icon: BookOpen,
  },
  {
    to: "/messages" as const,
    label: "Messages",
    hint: "Chat with teachers",
    icon: MessageSquare,
  },
] as const;

/** Right-side tools only when signed in. Guests use the top header. */
export function SideTaskbar() {
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isPending || !user) return null;

  return (
    <aside
      className={cn(
        "fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 flex-col sm:flex",
        "transition-[width] duration-200 ease-out",
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div
        className={cn(
          "mr-2 flex flex-col gap-1 rounded-l-xl border border-r-0 border-border bg-surface/95 py-2 shadow-lg backdrop-blur-md",
          open ? "w-44 px-2" : "w-12 items-center px-1",
        )}
      >
        {ITEMS.map((item) => {
          const active =
            pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted hover:bg-bg hover:text-fg",
                !open && "justify-center px-0",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {open ? (
                <span className="min-w-0">
                  <span className="block font-medium leading-tight">{item.label}</span>
                  <span className="block text-[10px] leading-tight text-subtle">
                    {item.hint}
                  </span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
