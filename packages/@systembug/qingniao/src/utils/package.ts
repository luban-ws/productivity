/**
 * 包管理工具
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { execSilent } from "./exec";
import type { PackageInfo } from "../types";

/**
 * 读取 package.json
 */
export function readPackageJson(path: string): any {
    const packageJsonPath = join(path, "package.json");
    if (!existsSync(packageJsonPath)) {
        return null;
    }

    try {
        return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    } catch {
        return null;
    }
}

/**
 * 发现所有包（使用 pnpm list，包括私有包）
 */
export async function discoverAllPackagesWithPnpm(rootDir: string): Promise<PackageInfo[]> {
    try {
        const output = execSilent("pnpm list -r --depth -1 --json");
        if (!output) return [];

        const packages: PackageInfo[] = [];
        const list = JSON.parse(output);

        // pnpm list 返回的是数组或对象，需要处理
        const processItem = (item: any) => {
            if (item.name && item.path) {
                const pkgJson = readPackageJson(item.path);
                if (pkgJson) {
                    packages.push({
                        name: item.name,
                        version: pkgJson.version || "0.0.0",
                        path: item.path,
                        private: pkgJson.private || false,
                    });
                }
            }
        };

        if (Array.isArray(list)) {
            list.forEach(processItem);
        } else if (list) {
            processItem(list);
        }

        return packages;
    } catch {
        return [];
    }
}

/**
 * 发现包（使用 pnpm list，仅可发布的包）
 * 同时验证包的发布配置
 */
export async function discoverPackagesWithPnpm(rootDir: string): Promise<PackageInfo[]> {
    const allPackages = await discoverAllPackagesWithPnpm(rootDir);
    // 过滤掉私有包，并验证发布配置
    return allPackages.filter((pkg) => {
        // 首先检查是否为私有包
        if (pkg.private) {
            return false;
        }
        // 验证发布配置
        const validation = validatePackageForPublish(pkg.path);
        return validation.valid;
    });
}

/**
 * 发现所有包（使用模式匹配，包括私有包）
 */
export async function discoverAllPackagesWithPattern(
    rootDir: string,
    patterns: string[],
): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];
    const packagesDir = join(rootDir, "packages");

    if (!existsSync(packagesDir)) {
        return [];
    }

    const dirs = readdirSync(packagesDir, { withFileTypes: true });

    for (const dir of dirs) {
        if (dir.isDirectory()) {
            const packagePath = join(packagesDir, dir.name);
            const pkgJson = readPackageJson(packagePath);

            if (pkgJson && pkgJson.name) {
                // 检查是否匹配模式
                const matches = patterns.some((pattern) => {
                    // 简单的 glob 匹配
                    const regex = new RegExp(pattern.replace(/\*/g, ".*").replace(/\//g, "\\/"));
                    return regex.test(pkgJson.name) || regex.test(packagePath);
                });

                if (matches || patterns.length === 0) {
                    packages.push({
                        name: pkgJson.name,
                        version: pkgJson.version || "0.0.0",
                        path: packagePath,
                        private: pkgJson.private || false,
                    });
                }
            }
        }
    }

    return packages;
}

/**
 * 发现包（使用模式匹配，仅可发布的包）
 * 同时验证包的发布配置
 */
export async function discoverPackagesWithPattern(
    rootDir: string,
    patterns: string[],
): Promise<PackageInfo[]> {
    const allPackages = await discoverAllPackagesWithPattern(rootDir, patterns);
    // 过滤掉私有包，并验证发布配置
    return allPackages.filter((pkg) => {
        // 首先检查是否为私有包
        if (pkg.private) {
            return false;
        }
        // 验证发布配置
        const validation = validatePackageForPublish(pkg.path);
        return validation.valid;
    });
}

/**
 * 验证包是否可以发布
 * 检查：
 * 1. 不是私有包
 * 2. 对于 scoped packages，publishConfig.access 必须是 "public"
 */
export function validatePackageForPublish(pkgPath: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];
    const pkgJson = readPackageJson(pkgPath);

    if (!pkgJson) {
        return {
            valid: false,
            errors: ["无法读取 package.json"],
            warnings: [],
        };
    }

    // 检查是否为私有包
    if (pkgJson.private === true) {
        errors.push("包标记为私有 (private: true)");
    }

    // 检查 scoped packages 的 publishConfig.access
    if (pkgJson.name && pkgJson.name.startsWith("@")) {
        const publishConfig = pkgJson.publishConfig || {};
        const access = publishConfig.access;

        if (access === undefined || access === null) {
            warnings.push(
                `Scoped package "${pkgJson.name}" 未设置 publishConfig.access，NPM 默认会使用 "restricted"（需要付费）。建议设置为 "public"`,
            );
        } else if (access !== "public") {
            errors.push(
                `Scoped package "${pkgJson.name}" 的 publishConfig.access 设置为 "${access}"，必须是 "public" 才能发布`,
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
