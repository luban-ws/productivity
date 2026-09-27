import { loadConfig } from "../config/loader";
import { JsonReporter } from "../reporters/json-reporter";
import type { PackageInfo, PublishConfig } from "../types";
import { discoverPackagesWithPnpm, discoverPackagesWithPattern } from "../utils/package";

export interface ReleasePlan {
    packages: Array<{ name: string; version: string }>;
    actions: string[];
    requiresConfirmation: boolean;
}

export function createReleasePlan(config: PublishConfig, packages: PackageInfo[]): ReleasePlan {
    const actions: string[] = [];
    if (config.checks?.auth !== false) actions.push("auth");
    if (config.checks?.git !== false && config.git?.enabled !== false) actions.push("git");
    if (config.build?.enabled !== false) actions.push("verify");
    actions.push("version");
    if (config.publish?.enabled !== false) actions.push("publish");

    return {
        packages: packages
            .filter((pkg) => !pkg.private)
            .map(({ name, version }) => ({ name, version })),
        actions,
        requiresConfirmation: true,
    };
}

export async function runPlan(rootDir: string, configPath?: string): Promise<ReleasePlan> {
    const config = await loadConfig(configPath);
    const packages = config.packages?.pattern
        ? await discoverPackagesWithPattern(
              rootDir,
              Array.isArray(config.packages.pattern)
                  ? config.packages.pattern
                  : [config.packages.pattern],
          )
        : await discoverPackagesWithPnpm(rootDir);
    return createReleasePlan(config, packages);
}

export function reportPlanJson(plan: ReleasePlan, reporter = new JsonReporter()): void {
    reporter.plan(plan.packages, plan.actions, plan.requiresConfirmation);
    reporter.result("succeeded", 0, "Release plan completed");
}
