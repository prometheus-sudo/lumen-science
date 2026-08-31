# Long-form lessons (20 000+ words each)

- Path: `src/lib/curriculum/longform/{field}/{conceptId}.md`
- 170 subtopics across all science fields
- Each file targets 20 000+ words of extended study text
- **Teacher override:** publish from `/teach` with the same field + concept id; that body replaces the built-in longform
- Loader: `getLongformLesson` — used by `/lesson/$slug/$conceptId`
- Priority: teacher lesson > longform markdown > short core summary
