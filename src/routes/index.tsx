import { createFileRoute } from "@tanstack/react-router";
import { FootballApp } from "@/game/overlays/App";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FootballApp />;
}
