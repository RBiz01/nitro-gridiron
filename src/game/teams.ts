import type { TeamId, TeamInfo } from "./types";

export const TEAMS: TeamInfo[] = [
  {
    id: "iron",
    city: "St. Louis",
    name: "Iron",
    abbr: "STL",
    primary: "#152238",
    secondary: "#c5ccd6",
    accent: "#e8eaee",
    helmet: "#1b2a44",
  },
  {
    id: "frost",
    city: "Chicago",
    name: "Frost",
    abbr: "CHI",
    primary: "#d9dee6",
    secondary: "#1a2230",
    accent: "#8fa0b8",
    helmet: "#dfe4ec",
  },
  {
    id: "outlaws",
    city: "Austin",
    name: "Outlaws",
    abbr: "AUS",
    primary: "#1c1c1e",
    secondary: "#c9cdd4",
    accent: "#f2f3f5",
    helmet: "#2a2a2e",
  },
  {
    id: "tide",
    city: "Tampa",
    name: "Tide",
    abbr: "TPA",
    primary: "#14302c",
    secondary: "#d6ddd8",
    accent: "#9bb0a6",
    helmet: "#1a3d37",
  },
];

export function teamById(id: TeamId): TeamInfo {
  return TEAMS.find((t) => t.id === id) ?? TEAMS[0];
}
