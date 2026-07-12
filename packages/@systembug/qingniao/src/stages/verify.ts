/**
 * 发布前验证：在版本号更新与 Git 标签之前运行质量检查与构建
 */

import type { Context, PublishConfig } from "../types";
import type { PackageInfo } from "../types";
import { exec } from "../utils/exec";
import { isMissingScriptError, toPublishErrorMessage } from "../utils/script-errors";
import { executeBuildSteps, verifyArtifacts } from "./build";
import { discoverAllPackagesWithPnpm } from "../utils/package";
import ora from "ora";
import { t } from "../messages.js";

/** 中止发布前验证并抛出可读错误 */
function abortVerificationStep(
    spinner: ReturnType<typeof ora>,
    error: unknown,
    scriptFallback: string,
    genericMessage: string,
): never {
    const raw = error instanceof Error ? error.message : String(error);
    const message = isMissingScriptError(raw)
        ? toPublishErrorMessage(error, scriptFallback)
        : genericMessage;
    spinner.fail(message);
    throw new Error(message);
}

function resolvePackageManagerCommand(config: PublishConfig): string {
    return config.project?.packageManager === "pnpm"
        ? "pnpm"
        : config.project?.packageManager === "yarn"
          ? "yarn"
          : "npm";
}

/**
 * 在版本更新与 Git 标签之前执行：安装依赖、lint、Prettier 检查、类型检查、测试、构建与产物验证
 */
export async function runPreReleaseVerification(
    config: PublishConfig,
    context: Context,
    packages: PackageInfo[],
    rootDir: string,
): Promise<void> {
    const pmCommand = resolvePackageManagerCommand(config);
    const gateSpinner = ora("发布前检查（lint / format / test / build）").start();
    gateSpinner.succeed();

    const installSpinner = ora("安装依赖").start();
    exec(`${pmCommand} install --frozen-lockfile`, {
        cwd: rootDir,
        silent: true,
        timeout: 15 * 60 * 1000,
        description: "安装依赖",
    });
    installSpinner.succeed();

    if (config.build?.preLintBuild && config.build.preLintBuild.length > 0) {
        for (const pkgName of config.build.preLintBuild) {
            const buildSpinner = ora(`构建 ${pkgName}（lint 依赖）`).start();
            try {
                if (pmCommand === "pnpm") {
                    exec(`pnpm --filter ${pkgName} build`, {
                        cwd: rootDir,
                        silent: true,
                        timeout: 30 * 60 * 1000,
                        description: `构建 ${pkgName}`,
                    });
                } else if (pmCommand === "yarn") {
                    exec(`yarn workspace ${pkgName} build`, {
                        cwd: rootDir,
                        silent: true,
                        timeout: 30 * 60 * 1000,
                        description: `构建 ${pkgName}`,
                    });
                } else {
                    let pkg = packages.find((p) => p.name === pkgName);
                    if (!pkg) {
                        const allPackages = await discoverAllPackagesWithPnpm(rootDir);
                        pkg = allPackages.find((p) => p.name === pkgName);
                    }
                    if (!pkg) {
                        throw new Error(`未找到包 ${pkgName}`);
                    }
                    exec("npm run build", {
                        cwd: pkg.path,
                        silent: true,
                        timeout: 30 * 60 * 1000,
                        description: `构建 ${pkgName}`,
                    });
                }
                buildSpinner.succeed();
            } catch (error: unknown) {
                abortVerificationStep(
                    buildSpinner,
                    error,
                    "build",
                    t("buildPreLintFailed", { package: pkgName }),
                );
            }
        }
    }

    if (config.checks?.lint !== false) {
        const lintSpinner = ora("运行 lint").start();
        try {
            exec(`${pmCommand} lint`, {
                cwd: rootDir,
                silent: true,
                timeout: 10 * 60 * 1000,
                description: "代码检查 (lint)",
            });
            lintSpinner.succeed();
        } catch (error: unknown) {
            abortVerificationStep(lintSpinner, error, "lint", t("lintFailed"));
        }
    }

    if (config.checks?.format !== false) {
        const formatCheckSpinner = ora("代码格式检查 (Prettier)").start();
        try {
            exec(`${pmCommand} format:check`, {
                cwd: rootDir,
                silent: true,
                timeout: 5 * 60 * 1000,
                description: "代码格式检查",
            });
            formatCheckSpinner.succeed();
        } catch (firstError: unknown) {
            const firstMsg = firstError instanceof Error ? firstError.message : String(firstError);
            if (isMissingScriptError(firstMsg)) {
                try {
                    exec(`npx prettier --check "**/*.{ts,tsx,md}"`, {
                        cwd: rootDir,
                        silent: true,
                        timeout: 5 * 60 * 1000,
                        description: "代码格式检查 (Prettier)",
                    });
                    formatCheckSpinner.succeed();
                } catch (secondError: unknown) {
                    const secondMsg =
                        secondError instanceof Error ? secondError.message : String(secondError);
                    const missingPrettier =
                        isMissingScriptError(secondMsg) ||
                        /Cannot find module|ENOENT/i.test(secondMsg);
                    const message = missingPrettier
                        ? t("formatCheckMissingScript")
                        : t("formatCheckFailed");
                    formatCheckSpinner.fail(message);
                    throw new Error(message);
                }
            } else {
                formatCheckSpinner.fail(t("formatCheckFailed"));
                throw firstError instanceof Error ? firstError : new Error(firstMsg);
            }
        }
    }

    if (config.checks?.typecheck !== false) {
        const typecheckSpinner = ora("TypeScript 类型检查").start();
        try {
            exec(`${pmCommand} typecheck`, {
                cwd: rootDir,
                silent: true,
                timeout: 5 * 60 * 1000,
                description: "TypeScript 类型检查",
            });
            typecheckSpinner.succeed();
        } catch (error: unknown) {
            abortVerificationStep(typecheckSpinner, error, "typecheck", t("typecheckFailed"));
        }
    }

    if (config.checks?.tests !== false) {
        const testSpinner = ora("运行测试").start();
        try {
            exec(`${pmCommand} test`, {
                cwd: rootDir,
                silent: true,
                timeout: 15 * 60 * 1000,
                description: "运行测试",
            });
            testSpinner.succeed();
        } catch (error: unknown) {
            abortVerificationStep(testSpinner, error, "test", t("testFailed"));
        }
    }

    const buildSpinner = ora("构建所有包").start();
    await executeBuildSteps(config, context);
    buildSpinner.succeed();

    const verifySpinner = ora("验证构建产物").start();
    await verifyArtifacts(config, context);
    verifySpinner.succeed();
}
