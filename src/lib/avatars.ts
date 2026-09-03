/** Preset profile pictures — colors + glyphs, no file upload required. */

export type AvatarPreset = {
  id: string;
  label: string;
  bg: string;
  fg: string;
  glyph: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "forest-l", label: "Forest L", bg: "#243d36", fg: "#f4f1ea", glyph: "L" },
  { id: "clay-s", label: "Clay S", bg: "#8f5a3c", fg: "#fff8f0", glyph: "S" },
  { id: "ink-q", label: "Ink Q", bg: "#1c2430", fg: "#e8eef6", glyph: "Q" },
  { id: "ocean-o", label: "Ocean O", bg: "#1e4d6b", fg: "#e6f4fb", glyph: "O" },
  { id: "violet-a", label: "Violet A", bg: "#4a3a6b", fg: "#f3eefc", glyph: "A" },
  { id: "rose-m", label: "Rose M", bg: "#7a3d4f", fg: "#fceef2", glyph: "M" },
  { id: "amber-e", label: "Amber E", bg: "#8a5b12", fg: "#fff8e8", glyph: "E" },
  { id: "slate-n", label: "Slate N", bg: "#4a5560", fg: "#f0f2f4", glyph: "N" },
  { id: "teal-t", label: "Teal T", bg: "#0f5c5c", fg: "#e6fafa", glyph: "T" },
  { id: "plum-r", label: "Plum R", bg: "#5c2d4a", fg: "#fceef6", glyph: "R" },
  { id: "leaf-b", label: "Leaf B", bg: "#2d5a27", fg: "#eef8ec", glyph: "B" },
  { id: "sky-c", label: "Sky C", bg: "#2a5a8a", fg: "#eaf3fc", glyph: "C" },
];

export function getAvatarPreset(id: string | null | undefined): AvatarPreset | null {
  if (!id) return null;
  return AVATAR_PRESETS.find((a) => a.id === id) ?? null;
}

export function avatarInitial(label: string): string {
  const t = label.trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}
