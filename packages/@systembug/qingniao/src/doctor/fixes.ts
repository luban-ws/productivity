/**
 * doctor --fix 自动修复
 */

import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { exec } from "../utils/exec";
import { detectChangeset, detectPackageManager } from "../utils/auto-detect";
import { readPackageJson } from "../utils/package";
import {
    listMissingRootScripts,
    mergeRootScripts,
    suggestDefaultScripts,
} from "../utils/root-scripts";
import type { DoctorFinding } from "./types";

const DEFAULT_QINGNIAO_CONFIG = `${JSON.stringify({ publish: { skipExisting: true } }, null, 2)}\n`;

/** 应用可自动修复项，返回已修复 finding id 列表 */
export function applyDoctorFixes(rootDir: string, findings: DoctorFinding[]): string[] {
    const fixed: string[] = [];
    const fixable = findings.filter((f) => f.fixable);

    const missingScripts = listMissingRootScripts(rootDir);
    if (missingScripts.length > 0) {
        const defaults = suggestDefaultScripts(rootDir);
        const toAdd: Record<string, string> = {};
        for (const name of missingScripts) {
            toAdd[name] = defaults[name];
        }
        const added = mergeRootScripts(rootDir, toAdd);
        if (added.length > 0) {
            fixed.push("scripts-root");
            for (const script of added) {
                fixed.push(`script-${script}`);
            }
        }
    }

    const configPath = join(rootDir, "qingniao.config.json");
    if (!existsSync(configPath) && fixable.some((f) => f.id === "qingniao-config")) {
        writeFileSync(configPath, DEFAULT_QINGNIAO_CONFIG, "utf-8");
        fixed.push("qingniao-config");
    }

    if (!detectChangeset(rootDir) && fixable.some((f) => f.id === "changeset-dir")) {
        const pkg = readPackageJson(rootDir);
        const devDeps =
            pkg && typeof pkg.devDependencies === "object" && pkg.devDependencies !== null
                ? (pkg.devDependencies as Record<string, string>)
                : {};
        if (devDeps["@changesets/cli"]) {
            const pm = detectPackageManager(rootDir) ?? "pnpm";
            const pmExec =
                pm === "pnpm" ? "pnpm exec" : pm === "yarn" ? "yarn" : "npx";
            exec(`${pmExec} changeset init`, {
                cwd: rootDir,
                silent: true,
                timeout: 5 * 60 * 1000,
                description: "初始化 Changeset",
            });
            fixed.push("changeset-dir");
        }
    }

    return [...new Set(fixed)];
}
