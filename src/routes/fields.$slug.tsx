import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/fields/$slug")({
  component: FieldLayout,
});

function FieldLayout() {
  return <Outlet />;
}
