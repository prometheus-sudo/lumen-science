/** Normalize paper authors from APIs/cache into a single display string. */
export function authorsToString(authors: unknown, max = 8): string {
  if (authors == null) return "";
  if (typeof authors === "string") {
    return authors
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, max)
      .join(", ");
  }
  if (Array.isArray(authors)) {
    const names = authors
      .map((a) => {
        if (typeof a === "string") return a.trim();
        if (a && typeof a === "object") {
          const o = a as Record<string, unknown>;
          if (typeof o.name === "string") return o.name.trim();
          if (typeof o.display_name === "string") return o.display_name.trim();
          if (o.author && typeof o.author === "object") {
            const a2 = o.author as Record<string, unknown>;
            if (typeof a2.display_name === "string") return a2.display_name.trim();
            if (typeof a2.name === "string") return a2.name.trim();
          }
          const given = typeof o.given === "string" ? o.given : "";
          const family = typeof o.family === "string" ? o.family : "";
          return [given, family].filter(Boolean).join(" ").trim();
        }
        return "";
      })
      .filter(Boolean)
      .slice(0, max);
    return names.join(", ");
  }
  return String(authors);
}
