import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GlossaryEntry = { term: string; definition: string };

/** Build a small glossary from key ideas and bold terms in the body. */
export function buildGlossary(
  body: string,
  keyIdeas: string[] = [],
  extra: GlossaryEntry[] = [],
): GlossaryEntry[] {
  const map = new Map<string, string>();

  for (const e of extra) {
    const k = e.term.trim();
    if (k.length >= 2) map.set(k.toLowerCase(), e.definition.trim() || k);
  }

  for (const idea of keyIdeas) {
    const m = idea.match(/^([^:—\-–]{2,60})\s*[:—\-–]\s*(.+)$/);
    if (m) {
      map.set(m[1].trim().toLowerCase(), m[2].trim());
    } else if (idea.trim().length >= 3 && idea.trim().length < 48) {
      map.set(idea.trim().toLowerCase(), idea.trim());
    }
  }

  const boldRe = /\*\*([^*]{2,48})\*\*/g;
  let bm: RegExpExecArray | null;
  while ((bm = boldRe.exec(body))) {
    const term = bm[1].trim();
    if (!map.has(term.toLowerCase()) && !/^\d+$/.test(term)) {
      map.set(term.toLowerCase(), `A key concept in this lesson: ${term}.`);
    }
  }

  const wikiRe = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let wm: RegExpExecArray | null;
  while ((wm = wikiRe.exec(body))) {
    const term = wm[1].trim();
    const def = (wm[2] || term).trim();
    if (term.length >= 2) map.set(term.toLowerCase(), def);
  }

  return [...map.entries()]
    .map(([k, definition]) => {
      const re = new RegExp(`\\b(${escapeReg(k)})\\b`, "i");
      const hit = body.match(re);
      const term = hit ? hit[1] : k;
      return { term, definition };
    })
    .sort((a, b) => a.term.localeCompare(b.term));
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function TermChip({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-primary/70 text-primary hover:border-primary"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        {term}
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 w-64 max-w-[70vw] rounded-md border border-border bg-zinc-900 p-3 text-left text-xs leading-relaxed text-zinc-100 shadow-lg"
        >
          <span className="font-semibold text-zinc-50">{term}</span>
          <span className="mt-1 block text-zinc-300">{definition}</span>
        </span>
      ) : null}
    </span>
  );
}

function linkifyLine(text: string, glossary: GlossaryEntry[], keyPrefix: string): ReactNode[] {
  let cleaned = text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$1");
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https:\/\/[^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  const pushWithTerms = (chunk: string, prefix: string) => {
    if (!chunk) return;
    const terms = [...glossary].sort((a, b) => b.term.length - a.term.length);
    if (!terms.length) {
      nodes.push(chunk);
      return;
    }
    const pattern = new RegExp(`\\b(${terms.map((t) => escapeReg(t.term)).join("|")})\\b`, "gi");
    let cLast = 0;
    let cm: RegExpExecArray | null;
    let j = 0;
    while ((cm = pattern.exec(chunk))) {
      if (cm.index > cLast) nodes.push(chunk.slice(cLast, cm.index));
      const matched = cm[1];
      const entry = terms.find((t) => t.term.toLowerCase() === matched.toLowerCase());
      if (entry) {
        nodes.push(
          <TermChip key={`${prefix}-t-${j}`} term={matched} definition={entry.definition} />,
        );
      } else {
        nodes.push(matched);
      }
      cLast = cm.index + matched.length;
      j++;
    }
    if (cLast < chunk.length) nodes.push(chunk.slice(cLast));
  };

  while ((m = re.exec(cleaned))) {
    if (m.index > last) pushWithTerms(cleaned.slice(last, m.index), `${keyPrefix}-${i}`);
    const token = m[0];
    if (token.startsWith("**")) {
      const inner = token.slice(2, -2);
      const entry = glossary.find((g) => g.term.toLowerCase() === inner.toLowerCase());
      nodes.push(
        entry ? (
          <TermChip key={`${keyPrefix}-b-${i}`} term={inner} definition={entry.definition} />
        ) : (
          <strong key={`${keyPrefix}-b-${i}`}>{inner}</strong>
        ),
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`${keyPrefix}-e-${i}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i}`}
          className="rounded-xs bg-fg/6 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
      if (link) {
        nodes.push(
          <a
            key={`${keyPrefix}-a-${i}`}
            href={link[2]}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-primary"
          >
            {link[1]}
          </a>,
        );
      }
    }
    last = m.index + token.length;
    i++;
  }
  if (last < cleaned.length) pushWithTerms(cleaned.slice(last), `${keyPrefix}-tail`);
  return nodes;
}

export function LessonWikiBody({
  markdown,
  glossary,
  className,
}: {
  markdown: string;
  glossary: GlossaryEntry[];
  className?: string;
}) {
  const blocks = useMemo(() => markdown.split(/\n\n+/).filter((b) => b.trim()), [markdown]);

  return (
    <div className={cn("space-y-4 text-base leading-relaxed", className)}>
      {blocks.map((block, i) => {
        const t = block.trim();
        if (t.startsWith("# ")) {
          return (
            <h2 key={i} className="pt-6 font-display text-2xl tracking-tight text-fg">
              {t.replace(/^#+\s*/, "")}
            </h2>
          );
        }
        if (t.startsWith("## ")) {
          return (
            <h3 key={i} className="pt-4 text-lg font-semibold text-fg">
              {t.replace(/^#+\s*/, "")}
            </h3>
          );
        }
        if (t.startsWith("### ")) {
          return (
            <h4 key={i} className="pt-3 text-base font-semibold text-fg">
              {t.replace(/^#+\s*/, "")}
            </h4>
          );
        }
        if (t.startsWith("|") && t.includes("|")) {
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-md border border-border bg-surface p-3 text-xs leading-relaxed"
            >
              {t}
            </pre>
          );
        }
        if (
          /^[-*]\s/m.test(t) &&
          t.split("\n").every(
            (l) =>
              /^[-*]\s|^$/.test(l.trim()) ||
              l.trim().startsWith("-") ||
              l.trim().startsWith("*"),
          )
        ) {
          const items = t.split("\n").filter((l) => l.trim());
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-fg/90">
              {items.map((item, j) => (
                <li key={j}>{linkifyLine(item.replace(/^[-*]\s+/, ""), glossary, `l${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-fg/90">
            {linkifyLine(t, glossary, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}

export function LessonGlossary({ entries }: { entries: GlossaryEntry[] }) {
  if (!entries.length) return null;
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-display text-xl tracking-tight">Glossary</h2>
      <p className="mt-1 text-xs text-muted">
        Click a dotted term in the article to see its definition, or browse below.
      </p>
      <dl className="mt-4 space-y-3">
        {entries.map((e) => (
          <div key={e.term} className="rounded-md border border-border bg-surface px-3 py-2">
            <dt className="text-sm font-semibold text-fg">{e.term}</dt>
            <dd className="mt-0.5 text-sm text-muted">{e.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
