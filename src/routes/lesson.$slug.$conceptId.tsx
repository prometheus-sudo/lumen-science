import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { getConcept, getField } from "@/lib/sciences";

export const Route = createFileRoute("/lesson/$slug/$conceptId")({
  component: LessonPage,
});

function LessonPage() {
  const { slug, conceptId } = Route.useParams();
  const found = getConcept(slug, conceptId);
  const fieldOnly = getField(slug);

  if (!found) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Lesson not found</h1>
          <p className="mt-4 text-sm text-muted">
            Looking for <strong>{conceptId}</strong> in <strong>{slug}</strong>
          </p>
          <p className="mt-2 text-xs text-subtle break-all">
            Available: {fieldOnly?.concepts?.map((c) => c.id).join(", ") || "none"}
          </p>
          <Link to="/explore" className="mt-6 inline-block text-sm text-primary">
            Back to sciences
          </Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  const { field, concept } = found;
  const ideas = concept.keyIdeas ?? [];
  const body = concept.summary || concept.whyItMatters || "";

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          to="/fields/$slug"
          params={{ slug: field.slug }}
          className="text-sm text-muted hover:text-fg"
        >
          ← {field.name}
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wide text-subtle">
          {concept.module || "Lesson"}
          {concept.minutes ? ` · ~${concept.minutes} min` : ""}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{concept.title}</h1>
        <p className="mt-3 text-base text-muted">{concept.whyItMatters}</p>

        <article className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
            Core lesson
          </h2>
          <p className="mt-4 text-base leading-relaxed whitespace-pre-wrap">{body}</p>
          {ideas.length > 0 ? (
            <ul className="mt-8 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {ideas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          ) : null}
        </article>

        <p className="mt-12 text-sm text-muted">
          Core lessons are free. Sign in later for level-adapted explanations and the tutor.
        </p>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
