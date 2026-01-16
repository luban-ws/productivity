/**
 * 构建验证
 */

import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { exec } from "../utils/exec";
import { readPackageJson } from "../utils/package";
import type { Context, PublishConfig } from "../types";

/**
 * 检查构建产物
 */
export function checkBuildArtifact(
    pkgPath: string,
    distPath?: string,
): {
    success: boolean;
    message?: string;
} {
    if (!distPath) {
        // 尝试从 package.json 推断
        const pkgJson = readPackageJson(pkgPath);
        if (pkgJson) {
            const main = typeof pkgJson.main === "string" ? pkgJson.main : undefined;
            const module = typeof pkgJson.module === "string" ? pkgJson.module : undefined;
            if (main) {
                distPath = main;
            } else if (module) {
                distPath = module;
            } else if (pkgJson.exports) {
                // 尝试从 exports 推断
                let exports: unknown;
                if (typeof pkgJson.exports === "string") {
                    exports = pkgJson.exports;
                } else if (typeof pkgJson.exports === "object" && pkgJson.exports !== null) {
                    const exportsObj = pkgJson.exports as Record<string, unknown>;
                    exports = exportsObj["."] || exportsObj["./"] || exportsObj.default;
                }
                if (typeof exports === "string") {
                    distPath = exports;
                } else if (
                    exports &&
                    typeof exports === "object" &&
                    exports !== null &&
                    "default" in exports
                ) {
                    const exportsWithDefault = exports as { default: unknown };
                    if (typeof exportsWithDefault.default === "string") {
                        distPath = exportsWithDefault.default;
                    }
                }
            }
        }
    }

    if (!distPath) {
        // 默认检查 dist 目录
        distPath = "dist";
    }

    const fullPath = join(pkgPath, distPath);
    if (!existsSync(fullPath)) {
        return {
            success: false,
            message: `构建产物不存在: ${distPath}`,
        };
    }

    try {
        // 检查路径是文件还是目录
        const stats = statSync(fullPath);
        if (stats.isFile()) {
            // 如果是文件，直接验证通过（文件已存在）
            return { success: true };
        } else if (stats.isDirectory()) {
            // 如果是目录，检查目录是否为空
            const files = readdirSync(fullPath);
            if (files.length === 0) {
                return {
                    success: false,
                    message: `构建产物为空: ${distPath}`,
                };
            }
            return { success: true };
        } else {
            // 既不是文件也不是目录（可能是符号链接等）
            return {
                success: false,
                message: `构建产物路径无效: ${distPath} (不是文件或目录)`,
            };
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `无法读取构建产物: ${distPath} - ${errorMessage}`,
        };
    }
}

/**
 * 执行构建步骤
 */
export async function executeBuildSteps(config: PublishConfig, context: Context): Promise<void> {
    const rootDir = context.rootDir;
    const buildSteps = config.build?.steps || [];

    if (buildSteps.length > 0) {
        // 按顺序执行所有构建步骤（包括 clean，如果配置了的话）
        for (const step of buildSteps) {
            if (step.condition && !step.condition(context)) {
                continue;
            }

            try {
                exec(step.command, {
                    cwd: step.cwd || rootDir,
                    silent: step.silent,
                });
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (step.skipOnError) {
                    // 跳过错误，继续执行
                } else {
                    throw new Error(`构建步骤失败: ${step.name} - ${errorMessage}`);
                }
            }
        }
    } else if (config.build?.useNx) {
        // 使用 Nx 构建
        const pmCommand =
            config.project?.packageManager === "pnpm"
                ? "pnpm"
                : config.project?.packageManager === "yarn"
                  ? "yarn"
                  : "npm";
        const nxTargets = config.build.nxTargets || ["build"];
        for (const target of nxTargets) {
            exec(`${pmCommand} nx run-many --target=${target} --all`, { cwd: rootDir });
        }
    } else if (config.build?.useTurbo) {
        const turboTasks = config.build.turboTasks || ["build"];
        exec(`turbo build ${turboTasks.join(" ")}`, { cwd: rootDir });
    } else {
        const pmCommand =
            config.project?.packageManager === "pnpm"
                ? "pnpm"
                : config.project?.packageManager === "yarn"
                  ? "yarn"
                  : "npm";
        exec(`${pmCommand} run build`, { cwd: rootDir });
    }
}

/**
 * 验证构建产物
 */
export async function verifyArtifacts(config: PublishConfig, context: Context): Promise<void> {
    for (const pkg of context.packages) {
        const distPath = config.build?.artifactPaths?.[pkg.name];
        const result = checkBuildArtifact(pkg.path, distPath);

        if (!result.success) {
            if (config.build?.skipMissingArtifacts) {
                continue;
            } else {
                throw new Error(`包 ${pkg.name} 构建验证失败: ${result.message}`);
            }
        }
    }
}
