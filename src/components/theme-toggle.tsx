import { useEffect, useState } from "react";

const KEY = "lumen-night";

export function applyNightClass(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("night", on);
}

export function ThemeToggle() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY) === "1";
    setNight(stored);
    applyNightClass(stored);
  }, []);

  function toggle() {
    const next = !night;
    setNight(next);
    localStorage.setItem(KEY, next ? "1" : "0");
    applyNightClass(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-sm px-2 py-1.5 text-sm text-muted transition-colors hover:text-fg"
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}
      title={night ? "Day mode" : "Night mode"}
    >
      {night ? "Day" : "Night"}
    </button>
  );
}
