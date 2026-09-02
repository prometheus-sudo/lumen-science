import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FieldGlyph } from "@/components/field-glyph";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { FIELDS } from "@/lib/sciences";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader solid />
      <main className="flex-1 pb-16">
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Free science learning from open research
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Lessons across the sciences, open-access papers, and Oracle for syllabi. Sign in to set
            your level and region. Teachers can add verified subtopics.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/explore">
                Browse sciences
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/oracle">Oracle</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/teach">Teach</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto mt-14 grid max-w-6xl gap-3 px-4 sm:grid-cols-3 sm:px-6">
          {[
            {
              t: "Open literature",
              d: "Landmark ideas and live open-access records for each field.",
            },
            {
              t: "Level and place",
              d: "Examples and wording can follow your school level and region.",
            },
            {
              t: "Syllabus and quizzes",
              d: "Oracle builds study paths; request quizzes on any topic.",
            },
          ].map((item) => (
            <article key={item.t} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-base font-semibold text-fg">{item.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.d}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Sciences</h2>
            <Link to="/explore" className="text-sm text-muted hover:text-fg">
              See all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((field) => (
              <Link
                key={field.slug}
                to="/fields/$slug"
                params={{ slug: field.slug }}
                className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/30"
              >
                <FieldGlyph slug={field.slug} className="size-8" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{field.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{field.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
