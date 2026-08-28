# Lumen — free science academy

A free, open science learning platform covering twelve fields: physics, chemistry, biology, astronomy, earth science, mathematics, computer science, medicine, neuroscience, ecology, materials, and psychology.

## What is new (vs prior App Builder snapshot)

- **Open-access literature only** — federated search across arXiv, PubMed Central / Europe PMC, DOAJ, PLOS, Zenodo, Creative Commons (Crossref), and life-science preprints.
- **No paywalled PDFs** are fetched.
- **Library** route (`/library`) for free-text OA search.
- **Paper cache** + **topic lessons** schema (`migrations/0003_open_library.sql`).
- Lessons, tutor, syllabi, auth, and level/region adaptation remain free.

## Stack

TanStack Start + React 19 + Tailwind v4 + Better Auth + Postgres/PGLite + xAI (Grok).

## Local development

```bash
npm install
npm run dev
```

Node 22+. Preview binds to `0.0.0.0:8080`.

## Related

Prior snapshot: [lion-eagle-pepper-topaz](https://github.com/prometheus-sudo/lion-eagle-pepper-topaz)
