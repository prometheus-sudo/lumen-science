# Lumen — free science academy

A free, open science learning platform covering twelve fields: physics, chemistry, biology, astronomy, earth science, mathematics, computer science, medicine, neuroscience, ecology, materials, and psychology.

**Repo:** https://github.com/prometheus-sudo/lumen-science

## Open-access layer (this repo)

This repository holds the Lumen open-access upgrades on top of the earlier App Builder snapshot:

| Path | Role |
|------|------|
| `src/lib/literature.ts` | Federated OA search: arXiv, Europe PMC / PMC, DOAJ, PLOS, Zenodo, Crossref CC |
| `src/lib/oa-sources.ts` | Source list + OA policy copy |
| `src/lib/server/papers.ts` | Cached paper fetch + `searchPapers` server fn |
| `migrations/0003_open_library.sql` | `paper_cache` + `topic_lessons` tables |
| `src/routes/library.tsx` | Free-text open library UI |
| `src/components/paper-card.tsx` | Paper display card |
| `src/components/site-header.tsx` | Nav includes **Library** |

**Policy:** only open works (public domain, CC, repository copies, preprints). No paywalled PDFs.

## Combine with the full app scaffold

The complete runnable app (auth, tutor, syllabi, field lessons, etc.) lives in the prior snapshot. Merge it with this OA layer:

```bash
git clone https://github.com/prometheus-sudo/lion-eagle-pepper-topaz.git lumen
cd lumen
git remote add lumen-oa https://github.com/prometheus-sudo/lumen-science.git
git fetch lumen-oa
# Copy OA files over the scaffold (or cherry-pick / merge):
git checkout lumen-oa/main -- \
  src/lib/literature.ts \
  src/lib/oa-sources.ts \
  src/lib/server/papers.ts \
  src/lib/og/site.json \
  src/routes/library.tsx \
  src/components/paper-card.tsx \
  src/components/site-header.tsx \
  migrations/0003_open_library.sql \
  README.md
# Commit on your branch, then push to lumen-science if you want a single full tree:
# git remote set-url origin https://github.com/prometheus-sudo/lumen-science.git
# git push -u origin main
```

Then:

```bash
npm install
npm run dev
```

Node 22+. Preview binds to `0.0.0.0:8080`.

## Stack

TanStack Start + React 19 + Tailwind v4 + Better Auth + Postgres/PGLite + xAI (Grok) for adaptive lessons and the tutor.

## License

Application code is yours under this repository. Literature is linked from third-party open archives; respect each source’s license.
