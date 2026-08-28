import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RichText } from "@/components/rich-text";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getConcept } from "@/lib/sciences";
import { videosForConcept, youtubeWatchUrl } from "@/lib/topic-videos";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getProfile, type Profile } from "@/lib/server/profile";
import { explainConcept, markConceptProgress } from "@/lib/server/explain";
import { LEARNING_LEVELS, REGIONS, languageLabel } from "@/lib/learner";

export const Route = createFileRoute("/fields/$slug/learn/$conceptId")({
  component: LearnPage,
});

function LearnPage() {
  const { slug, conceptId } = Route.useParams();
  const found = getConcept(slug, conceptId);
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adapted, setAdapted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [user]);

  if (!found) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Lesson not found</h1>
          <Link to="/explore" className="mt-4 inline-block text-sm text-muted">
            Back to the sciences
          </Link>
        </main>
      </div>
    );
  }

  const { field, concept } = found;
  const levelLabel = LEARNING_LEVELS.find((l) => l.id === profile?.learningLevel)?.label;
  const regionLabel = REGIONS.find((r) => r.id === profile?.region)?.label;

  async function adapt() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const result = await explainConcept({
        data: { slug: field.slug, conceptId: concept.id },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAdapted(result.text);
      await markConceptProgress({
        data: { slug: field.slug, conceptId: concept.id, status: "reading" },
      });
    } catch {
      setError("Could not write this lesson just now.");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    try {
      await markConceptProgress({
        data: { slug: field.slug, conceptId: concept.id, status: "complete" },
      });
      toast("Marked as read");
    } catch {
      toast("Could not save progress");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16 sm:pb-0">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          to="/fields/$slug"
          params={{ slug: field.slug }}
          className="text-sm text-muted hover:text-fg"
        >
          {field.name}
        </Link>
        <h1 className="mt-4 font-display text-4xl tracking-tight">{concept.title}</h1>
        <p className="mt-3 text-sm text-muted">{concept.whyItMatters}</p>

        <article className="mt-10">
          <h2 className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
            Core account
          </h2>
          <p className="mt-3 text-base leading-relaxed">{concept.summary}</p>
        </article>

        <VideoLessons fieldSlug={field.slug} conceptId={concept.id} />

        <section className="mt-12 rounded-lg border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-tight">Written for you</h2>
          {isPending ? (
            <p className="mt-3 text-sm text-muted">Checking your session…</p>
          ) : !user ? (
            <div className="mt-3">
              <p className="text-sm leading-relaxed text-muted">
                Sign in to have this lesson rewritten for your learning level, region, and
                language. It stays free.
              </p>
              <Button asChild className="mt-4">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                {profile
                  ? `${levelLabel} · ${regionLabel} · ${languageLabel(profile.languagePref)}`
                  : "Using your saved level and region."}{" "}
                <Link to="/account" className="underline-offset-4 hover:underline">
                  Change
                </Link>
              </p>
              {!adapted && (
                <Button className="mt-5" onClick={() => void adapt()} disabled={busy}>
                  {busy ? "Writing…" : "Write this at my level"}
                </Button>
              )}
              {error && <p className="mt-4 text-sm text-danger">{error}</p>}
              {adapted && (
                <div className="mt-6">
                  <RichText text={adapted} />
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => void complete()}>
                      Mark as read
                    </Button>
                    <Button asChild variant="ghost">
                      <Link to="/tutor">Ask the tutor</Link>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}

function VideoLessons({ fieldSlug, conceptId }: { fieldSlug: string; conceptId: string }) {
  const videos = videosForConcept(fieldSlug, conceptId);
  if (videos.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
        Video lessons
      </h2>
      <p className="mt-2 text-sm text-muted">
        Curated from Veritasium, The Efficient Engineer, and The Organic Chemistry Tutor —
        free to watch on YouTube.
      </p>
      <ul className="mt-5 space-y-3">
        {videos.map((v) => (
          <li
            key={v.youtubeId}
            className="rounded-lg border border-border bg-surface p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a
                href={youtubeWatchUrl(v.youtubeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-fg hover:underline"
              >
                {v.title}
              </a>
              <span className="text-xs tracking-wide text-muted uppercase">{v.channel}</span>
            </div>
            {v.note ? <p className="mt-2 text-sm leading-relaxed text-muted">{v.note}</p> : null}
            <a
              href={youtubeWatchUrl(v.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Watch on YouTube →
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
