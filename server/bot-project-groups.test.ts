import { describe, expect, it } from "vitest";

import {
  botMatchesProjectSearch,
  groupBotsByProject,
  NO_PROJECT_KEY,
  projectLabel,
} from "../src/lib/bot-project-groups.ts";

describe("sidebar project groups", () => {
  const bots = [
    { id: "taxi-review", name: "Reviewer", cwd: "/work/Taxi Project" },
    { id: "axe-lead", name: "Lead", cwd: "/work/Axe-Fx MCP" },
    { id: "loose", name: "Scratch" },
    { id: "axe-build", name: "Builder", cwd: "/work/Axe-Fx MCP" },
  ];

  it("groups exact working folders, sorts labels, and puts unassigned bots last", () => {
    const groups = groupBotsByProject(bots);
    expect(groups.map((group) => group.label)).toEqual(["Axe-Fx MCP", "Taxi Project", "No project"]);
    expect(groups[0]?.bots.map((bot) => bot.id)).toEqual(["axe-lead", "axe-build"]);
    expect(groups.at(-1)?.key).toBe(NO_PROJECT_KEY);
  });

  it("preserves the incoming bot order within each project", () => {
    const groups = groupBotsByProject([bots[3]!, bots[1]!, bots[0]!]);
    expect(groups[0]?.bots.map((bot) => bot.id)).toEqual(["axe-build", "axe-lead"]);
  });

  it("derives readable labels from POSIX, Windows, and root paths", () => {
    expect(projectLabel("/work/Axe-Fx MCP/")).toBe("Axe-Fx MCP");
    expect(projectLabel("C:\\Work\\Taxi Project")).toBe("Taxi Project");
    expect(projectLabel("/")).toBe("/");
    expect(projectLabel()).toBe("No project");
  });

  it("searches bot metadata plus the full project path and label", () => {
    expect(botMatchesProjectSearch(bots[1]!, "axe-fx")).toBe(true);
    expect(botMatchesProjectSearch(bots[1]!, "/work/axe")).toBe(true);
    expect(botMatchesProjectSearch(bots[1]!, "builder")).toBe(false);
    expect(botMatchesProjectSearch(bots[2]!, "no project")).toBe(true);
  });
});
