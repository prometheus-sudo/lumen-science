import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path — chatbot is named Oracle */
export const Route = createFileRoute("/tutor")({
  beforeLoad: () => {
    throw redirect({ to: "/oracle" });
  },
});
