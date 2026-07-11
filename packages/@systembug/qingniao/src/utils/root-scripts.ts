/**
 * 根目录 package.json scripts 读写
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { detectTurbo } from "./auto-detect";
import { readPackageJson } from "./package";
import { t } from "../messages.js";

export const RELEASE_SCRIPT_NAME = "release";
export const RELEASE_SCRIPT_VALUE = "qingniao";

/** 发布流程默认需要的根 scripts */
export const REQUIRED_ROOT_SCRIPTS = [
    "lint",
    "format",
    "format:check",
    "typecheck",
    "test",
    "build",
    RELEASE_SCRIPT_NAME,
] as const;

export type RequiredRootScript = (typeof REQUIRED_ROOT_SCRIPTS)[number];

/** 读取根 scripts 字段 */
export function readRootScripts(rootDir: string): Record<string, string> {
    const pkg = readPackageJson(rootDir);
    if (!pkg || typeof pkg.scripts !== "object" || pkg.scripts === null) {
        return {};
    }
    const scripts = pkg.scripts as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(scripts)) {
        if (typeof value === "string") {
            result[key] = value;
        }
    }
    return result;
}

/** 根 package.json 是否包含某 script */
export function hasRootScript(rootDir: string, scriptName: string): boolean {
    const scripts = readRootScripts(rootDir);
    return typeof scripts[scriptName] === "string" && scripts[scriptName].length > 0;
}

/** 是否具备 format 检查能力（format:check 或 prettier 可回退） */
export function hasFormatCheckScript(rootDir: string): boolean {
    return hasRootScript(rootDir, "format:check");
}

/** 推断 monorepo 默认 script 命令 */
export function suggestDefaultScripts(rootDir: string): Record<RequiredRootScript, string> {
    const turboPrefix = detectTurbo(rootDir) ? "turbo run" : "pnpm -r run";
    return {
        lint: `${turboPrefix} lint`,
        format: 'prettier --write "**/*.{ts,tsx,md,json}"',
        "format:check": 'prettier --check "**/*.{ts,tsx,md,json}"',
        typecheck: `${turboPrefix} typecheck`,
        test: `${turboPrefix} test`,
        build: `${turboPrefix} build`,
        [RELEASE_SCRIPT_NAME]: RELEASE_SCRIPT_VALUE,
    };
}

/** 列出缺失的必需 scripts（format:check 单独逻辑） */
export function listMissingRootScripts(rootDir: string): RequiredRootScript[] {
    const missing: RequiredRootScript[] = [];
    for (const name of REQUIRED_ROOT_SCRIPTS) {
        if (name === "format:check") {
            if (!hasFormatCheckScript(rootDir)) {
                missing.push(name);
            }
            continue;
        }
        if (!hasRootScript(rootDir, name)) {
            missing.push(name);
        }
    }
    return missing;
}

/** 向根 package.json 合并 scripts（不覆盖已有项） */
export function mergeRootScripts(rootDir: string, additions: Record<string, string>): string[] {
    const pkg = readPackageJson(rootDir);
    if (!pkg) {
        throw new Error(t("rootPackageJsonMissing"));
    }

    const existing =
        typeof pkg.scripts === "object" && pkg.scripts !== null
            ? { ...(pkg.scripts as Record<string, string>) }
            : {};

    const added: string[] = [];
    for (const [key, value] of Object.entries(additions)) {
        if (!existing[key]) {
            existing[key] = value;
            added.push(key);
        }
    }

    if (added.length === 0) {
        return added;
    }

    pkg.scripts = existing;
    writeFileSync(join(rootDir, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`, "utf-8");
    return added;
}
