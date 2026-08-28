import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-3xl tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted">{error.message}</p>
      <a href="/" className="text-sm text-primary hover:underline">
        Back home
      </a>
    </div>
  );
}
