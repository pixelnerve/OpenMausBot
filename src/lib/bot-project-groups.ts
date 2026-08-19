export const NO_PROJECT_KEY = "__no_project__";

export interface ProjectGroupedBot {
  id: string;
  cwd?: string;
}

export interface BotProjectGroup<T extends ProjectGroupedBot> {
  key: string;
  label: string;
  cwd: string | null;
  bots: T[];
}

export function projectKey(cwd?: string): string {
  return cwd?.trim() || NO_PROJECT_KEY;
}

export function projectLabel(cwd?: string): string {
  const path = cwd?.trim();
  if (!path) return "No project";
  const withoutTrailingSeparators = path.replace(/[\\/]+$/, "");
  if (!withoutTrailingSeparators) return path;
  return withoutTrailingSeparators.split(/[\\/]/).filter(Boolean).at(-1) ?? path;
}

/** Group a pre-sorted bot list without disturbing its order inside a project. */
export function groupBotsByProject<T extends ProjectGroupedBot>(bots: T[]): BotProjectGroup<T>[] {
  const byProject = new Map<string, BotProjectGroup<T>>();
  for (const bot of bots) {
    const key = projectKey(bot.cwd);
    let group = byProject.get(key);
    if (!group) {
      group = {
        key,
        label: projectLabel(bot.cwd),
        cwd: bot.cwd?.trim() || null,
        bots: [],
      };
      byProject.set(key, group);
    }
    group.bots.push(bot);
  }
  return [...byProject.values()].sort((a, b) => {
    if (a.key === NO_PROJECT_KEY) return 1;
    if (b.key === NO_PROJECT_KEY) return -1;
    return a.label.localeCompare(b.label) || a.key.localeCompare(b.key);
  });
}

export function botMatchesProjectSearch(
  bot: ProjectGroupedBot & { name?: string; title?: string; description?: string },
  query: string,
): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return [bot.name, bot.title, bot.description, bot.cwd, projectLabel(bot.cwd)]
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase().includes(needle));
}
