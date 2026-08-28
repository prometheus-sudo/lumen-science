# Lumen — free science academy

**Repo:** https://github.com/prometheus-sudo/lumen-science  
**Full base scaffold:** https://github.com/prometheus-sudo/lion-eagle-pepper-topaz

A free science learning platform: lessons across twelve fields, adaptive language by level and region, AI tutor + syllabi (login), and **open-access literature only** (arXiv, PubMed Central, DOAJ, PLOS, Zenodo, Crossref CC, preprints).

## What’s already on this repo (OA layer + config)

- `src/lib/literature.ts` — federated OA search
- `src/lib/oa-sources.ts` — source list + policy
- `src/lib/server/papers.ts` — cached paper APIs
- `migrations/0003_open_library.sql` — paper cache + topic lessons
- `src/routes/library.tsx` + `src/components/paper-card.tsx` — Library UI
- `src/components/site-header.tsx` — Library in nav
- Config: `package.json`, `tsconfig.json`, utils, router, migrations 0001–0003

## Get a full runnable app (one command)

The complete app (auth, tutor, syllabi, field lessons, UI) is in the prior snapshot. Merge it with this OA layer:

```bash
git clone https://github.com/prometheus-sudo/lion-eagle-pepper-topaz.git lumen
cd lumen
git remote add lumen-oa https://github.com/prometheus-sudo/lumen-science.git
git fetch lumen-oa
git checkout lumen-oa/main -- \
  src/lib/literature.ts \
  src/lib/oa-sources.ts \
  src/lib/server/papers.ts \
  src/lib/og/site.json \
  src/routes/library.tsx \
  src/components/paper-card.tsx \
  src/components/site-header.tsx \
  migrations/0003_open_library.sql \
  README.md \
  package.json

npm install
npm run dev
```

Then optionally publish the combined tree back to this repo:

```bash
git remote set-url origin https://github.com/prometheus-sudo/lumen-science.git
git add -A
git commit -m "Full Lumen app + open-access literature layer"
git push -u origin main
```

Requires Node 22+. Dev server: `0.0.0.0:8080`.

## Stack

TanStack Start · React 19 · Tailwind v4 · Better Auth · Postgres/PGLite · xAI Grok

## License

App code is yours in this repository. Linked literature remains under each archive’s license.
