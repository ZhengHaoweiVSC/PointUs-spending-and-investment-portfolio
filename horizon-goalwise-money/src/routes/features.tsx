import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/features")({
  beforeLoad: () => {
    throw redirect({ to: "/how-it-works", statusCode: 301 });
  },
});
