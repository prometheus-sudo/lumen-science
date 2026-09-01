# Lumen — free science academy

A free, open science learning platform covering twelve fields: physics, chemistry, biology, astronomy, earth science, mathematics, computer science, medicine, neuroscience, ecology, materials, and psychology.

**Repo:** https://github.com/prometheus-sudo/lumen-science

## Features

- Lessons across the sciences with adaptive language by learning level and region
- Extended lessons (20 000+ words per subtopic) under `src/lib/curriculum/longform/`
- **Open-access literature only** — federated search across arXiv, PubMed Central / Europe PMC, DOAJ, PLOS, Zenodo, and related OA sources
- Library (`/library`) for free-text OA paper search
- **Oracle** — adaptive science chatbot and personalized syllabi (login required)
- Teacher mode with fact-check and long-form integration
- Entirely free — no paywalled content fetched

## Stack

TanStack Start + React 19 + Tailwind v4 + Better Auth + Postgres/PGLite

## Local development

```bash
npm install
npm run dev
```

Generate extended lessons (optional, large):

```bash
python scripts/generate-longform.py
```

Requires Node 22+. Preview binds to `0.0.0.0:8080`.

## License

Application code is yours under this repository. Literature is linked from third-party open archives; respect each source’s license.
