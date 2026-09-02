import type { LiteratureWork } from "@/lib/literature";
import { authorsToString } from "@/lib/authors-display";

export function PaperCard({ work }: { work: LiteratureWork }) {
  const authors = authorsToString(work.authors);
  return (
    <article className="rounded-md border border-border/80 bg-bg/40 p-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-wide text-muted uppercase">
        <span>{work.source}</span>
        {work.year ? <span>· {work.year}</span> : null}
        {work.license ? <span>· {work.license}</span> : null}
      </div>
      <h3 className="mt-2 text-base font-medium leading-snug text-fg">
        {work.url ? (
          <a href={work.url} target="_blank" rel="noreferrer" className="hover:underline">
            {work.title}
          </a>
        ) : (
          work.title
        )}
      </h3>
      {authors ? <p className="mt-1 text-sm text-muted">{authors}</p> : null}
      {work.venue ? <p className="mt-0.5 text-xs text-muted">{work.venue}</p> : null}
      {work.abstract ? (
        <p className="mt-2 line-clamp-3 text-sm text-muted">{work.abstract}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {work.pdfUrl ? (
          <a
            href={work.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            PDF
          </a>
        ) : null}
        {work.doi ? (
          <a
            href={`https://doi.org/${work.doi}`}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-fg"
          >
            doi:{work.doi}
          </a>
        ) : null}
      </div>
    </article>
  );
}
