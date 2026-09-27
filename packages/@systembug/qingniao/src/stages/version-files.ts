/**
 * 版本号同步到 package.json 以外的清单文件。
 * 默认包含仓库内的 skill-release.json 与 plugin.json。
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { isAbsolute, join, relative, resolve, sep } from "path";

/** Birdify 技能发布清单文件名 */
export const SKILL_RELEASE_FILE_NAME = "skill-release.json";

/** 插件清单文件名 */
export const PLUGIN_MANIFEST_FILE_NAME = "plugin.json";

/** 升版本时自动改写 version 的清单文件名 */
export const VERSION_MANIFEST_FILE_NAMES = [
    SKILL_RELEASE_FILE_NAME,
    PLUGIN_MANIFEST_FILE_NAME,
] as const;

const VERSION_MANIFEST_FILE_NAME_SET = new Set<string>(VERSION_MANIFEST_FILE_NAMES);

/** 遍历时跳过的目录，避免把依赖和构建产物当成发布清单 */
const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "dist", "coverage", ".turbo"]);

/**
 * 收集项目内全部 skill-release.json 与 plugin.json 的相对路径
 */
export function discoverVersionManifestFiles(rootDir: string): string[] {
    const found: string[] = [];

    const walk = (dir: string): void => {
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            const entryPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                if (SKIP_DIR_NAMES.has(entry.name)) {
                    continue;
                }
                walk(entryPath);
                continue;
            }
            if (entry.isFile() && VERSION_MANIFEST_FILE_NAME_SET.has(entry.name)) {
                found.push(relative(rootDir, entryPath));
            }
        }
    };

    walk(rootDir);
    return found.sort();
}

/**
 * 配置路径必须落在项目根目录内
 */
function resolveInsideRoot(rootDir: string, file: string): string {
    const root = resolve(rootDir);
    const target = resolve(isAbsolute(file) ? file : join(root, file));
    const rel = relative(root, target);
    const outside = rel === ".." || rel.startsWith(`..${sep}`) || rel === "";
    if (outside) {
        throw new Error(`版本文件必须位于项目根目录内: ${file}`);
    }
    return rel;
}

/**
 * 自动发现的 skill-release.json 与 plugin.json，加上 version.files 里声明的额外文件
 */
export function collectVersionFiles(rootDir: string, configured: readonly string[] = []): string[] {
    const discovered = discoverVersionManifestFiles(rootDir);
    const declared = configured.map((file) => resolveInsideRoot(rootDir, file));
    return [...new Set([...discovered, ...declared])].sort();
}

/**
 * 把 JSON 对象的 version 字段写成给定版本，保留其余字段
 */
export function writeJsonVersion(absolutePath: string, version: string): void {
    if (!existsSync(absolutePath)) {
        throw new Error(`未找到版本文件: ${absolutePath}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(readFileSync(absolutePath, "utf-8"));
    } catch {
        throw new Error(`版本文件不是合法 JSON: ${absolutePath}`);
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(`版本文件必须是 JSON 对象: ${absolutePath}`);
    }

    const record = parsed as Record<string, unknown>;
    record.version = version;
    writeFileSync(absolutePath, `${JSON.stringify(record, null, 2)}\n`, "utf-8");
}

/**
 * 将新版本写入全部版本清单，返回已更新的相对路径
 */
export function syncVersionFiles(
    rootDir: string,
    version: string,
    configured: readonly string[] = [],
): string[] {
    const files = collectVersionFiles(rootDir, configured);
    for (const file of files) {
        writeJsonVersion(join(rootDir, file), version);
    }
    return files;
}
