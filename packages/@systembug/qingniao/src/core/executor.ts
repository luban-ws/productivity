/**
 * 执行引擎
 */

import type { Context, PublishConfig } from "../types";
import { checkNpmAuth } from "../stages/auth";
import { getCurrentBranch, hasUncommittedChanges, hasUnpushedCommits } from "../stages/git";
import {
    discoverPackagesWithPnpm,
    discoverPackagesWithPattern,
    discoverAllPackagesWithPnpm,
} from "../utils/package";
import { exec } from "../utils/exec";
import { applyVersionUpdate } from "../stages/version";
import { verifyArtifacts } from "../stages/build";
import { runPreReleaseVerification } from "../stages/verify";
import { publishPackages, publishPackagesDryRun, checkPackageExists } from "../stages/publish";
import ora from "ora";
import {
    checkRemoteUpToDate,
    pullRemoteUpdates,
    commitVersionUpdate,
    createGitTag,
    pushToRemote,
} from "../stages/git";
import { hasChangesetFiles as checkHasChangesetFiles, detectChangeset } from "../utils/auto-detect";
import { discoverAllWorkspacePackages } from "../stages/version";
import { confirm, select } from "../utils/prompts";
import { readPackageJson, validatePackageForPublish } from "../utils/package";
import { isMissingScriptError, toPublishErrorMessage } from "../utils/script-errors";
import { resolveNonInteractiveVersionMethod, type VersionUpdateMethod } from "./version-strategy";
import { t } from "../messages.js";

/** 中止发布步骤并抛出可读错误（避免 pnpm ELIFECYCLE 噪音） */
function abortPublishStep(
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

/**
 * 显示包列表（TUI：单行摘要，不逐条打 log）
 */
function showPackageList(
    packages: Array<{ name: string; version: string; path: string; private?: boolean }>,
) {
    const privateCount = packages.filter((p) => p.private).length;
    const publicCount = packages.length - privateCount;
    const summary =
        privateCount === 0
            ? `共 ${packages.length} 个包将被更新版本号`
            : `共 ${packages.length} 个包将被更新版本号（${publicCount} 个公共，${privateCount} 个私有）`;
    ora().succeed(`📦 ${summary}`);
}

/**
 * 执行发布流程
 */
/**
 * 检查 publishConfig.namespace 并发出警告
 */
function checkPublishConfigNamespace(rootDir: string): void {
    const rootPkg = readPackageJson(rootDir);
    const publishConfig =
        rootPkg && typeof rootPkg.publishConfig === "object" && rootPkg.publishConfig !== null
            ? (rootPkg.publishConfig as Record<string, unknown>)
            : null;
    if (publishConfig?.namespace) {
        ora().warn("⚠️  警告: 检测到 package.json 中存在 publishConfig.namespace 配置");
        ora().warn("   NPM 不支持 publishConfig.namespace，此配置将被忽略。");
        ora().warn("   如需使用命名空间，请考虑使用 scoped packages (如 @namespace/package-name)");
    }
}

export async function executePublish(
    config: PublishConfig,
    context: Context,
    options: {
        dryRun?: boolean;
        skipVersion?: boolean;
        skipBuild?: boolean;
        skipPublish?: boolean;
        yes?: boolean;
    },
): Promise<void> {
    const rootDir = context.rootDir;

    // 检查 publishConfig.namespace 配置
    checkPublishConfigNamespace(rootDir);

    // 1. 检查 NPM 认证
    if (config.checks?.auth !== false) {
        const spinner = ora("检查 NPM 认证").start();
        const packageManager = config.project?.packageManager;
        const npmAuth = await checkNpmAuth(packageManager);
        if (!npmAuth) {
            spinner.fail();
            const pmCommand =
                packageManager === "pnpm" ? "pnpm" : packageManager === "yarn" ? "yarn" : "npm";
            throw new Error(`未登录 NPM，请先运行: ${pmCommand} login`);
        }
        spinner.succeed(`已登录 NPM: ${npmAuth.username}`);

        // 检查 registry 警告
        if (!npmAuth.registry.includes("npmjs.org")) {
            ora().warn(`⚠️  当前 registry: ${npmAuth.registry}`);
            if (!options.yes) {
                const shouldContinue = await confirm("是否继续使用此 registry?", false);
                if (!shouldContinue) {
                    throw new Error("已取消发布");
                }
            }
        }
    }

    // 2. 检查 Git 状态
    if (config.checks?.git !== false && config.git?.enabled !== false) {
        const gitCheckSpinner = ora("检查 Git 状态").start();
        const branch = getCurrentBranch() || "main";
        const allowedBranches = Array.isArray(config.git?.branch)
            ? config.git.branch
            : config.git?.branch
              ? [config.git.branch]
              : ["main", "master"];

        if (branch && !allowedBranches.includes(branch)) {
            gitCheckSpinner.stop();
            if (!options.yes) {
                const shouldContinue = await confirm(
                    `当前不在 ${allowedBranches.join(" 或 ")} 分支 (${branch})，是否继续?`,
                    false,
                );
                if (!shouldContinue) {
                    throw new Error("已取消发布");
                }
            }
            gitCheckSpinner.start();
        }

        if (config.git?.requireClean !== false && hasUncommittedChanges()) {
            gitCheckSpinner.fail();
            throw new Error("存在未提交的更改，请先提交或暂存所有更改");
        }

        if (config.git?.requireUpToDate !== false && branch) {
            const unpushed = hasUnpushedCommits(branch);
            if (unpushed && !options.yes) {
                gitCheckSpinner.stop();
                const shouldContinue = await confirm("存在未推送的提交，是否继续?", true);
                if (!shouldContinue) {
                    throw new Error("已取消发布");
                }
                gitCheckSpinner.start();
            }
        }
        gitCheckSpinner.succeed("Git 状态检查通过");
    }

    // 2.5 检查远程分支是否最新
    if (config.git?.enabled !== false && !options.yes) {
        const branch = getCurrentBranch() || "main";
        const remoteStatus = checkRemoteUpToDate(branch);

        if (!remoteStatus.isUpToDate && remoteStatus.remoteCommit) {
            const shouldPull = await confirm("远程分支有更新，是否先拉取? (推荐)", true);
            if (shouldPull) {
                const pullSpinner = ora("拉取远程更新").start();
                try {
                    pullRemoteUpdates(branch);
                    pullSpinner.succeed("已拉取远程更新");
                } catch (error: unknown) {
                    pullSpinner.fail("拉取失败，请手动解决冲突");
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    throw new Error(`拉取失败，请手动解决冲突: ${errorMessage}`);
                }
            } else {
                ora().warn("跳过拉取，继续使用本地版本");
            }
        }
    }

    // 3. 发现包
    let packages = context.packages;

    if (packages.length === 0) {
        const spinner = ora("发现包").start();
        const workspace = config.workspace;
        if (workspace?.enabled) {
            packages = await discoverPackagesWithPnpm(rootDir);
        } else if (config.packages?.pattern) {
            const patterns = Array.isArray(config.packages.pattern)
                ? config.packages.pattern
                : [config.packages.pattern];
            packages = await discoverPackagesWithPattern(rootDir, patterns);
        } else {
            packages = await discoverPackagesWithPnpm(rootDir);
        }

        // 应用过滤
        if (config.packages?.filter) {
            packages = packages.filter(config.packages.filter);
        }

        // 验证每个包的发布配置
        const validPackages: typeof packages = [];
        const invalidPackages: Array<{
            pkg: (typeof packages)[0];
            errors: string[];
            warnings: string[];
        }> = [];

        for (const pkg of packages) {
            const validation = validatePackageForPublish(pkg.path);
            if (validation.valid) {
                validPackages.push(pkg);
                // 显示警告（如果有）
                if (validation.warnings.length > 0) {
                    ora().warn(`${pkg.name}: ${validation.warnings.join("; ")}`);
                }
            } else {
                invalidPackages.push({
                    pkg,
                    errors: validation.errors,
                    warnings: validation.warnings,
                });
            }
        }

        // 如果有无效的包，显示错误信息
        if (invalidPackages.length > 0) {
            ora().fail("\n❌ 以下包无法发布:\n");
            invalidPackages.forEach(({ pkg, errors, warnings }) => {
                ora().fail(`${pkg.name} (${pkg.path}):`);
                errors.forEach((error) => {
                    ora().fail(`    - ${error}`);
                });
                warnings.forEach((warning) => {
                    ora().warn(`    ⚠️  ${warning}`);
                });
            });
            ora().fail("");
        }

        packages = validPackages;

        if (packages.length === 0) {
            spinner.fail();
            throw new Error("未找到可发布的包（所有包都被过滤或配置无效）");
        }

        spinner.succeed(`发现 ${packages.length} 个可发布的包`);
    }

    if (packages.length === 0) {
        throw new Error("未找到可发布的包");
    }

    // 4. 发布前验证（lint / format:check / typecheck / test / build）— 必须在版本号更新与 Git 标签之前
    if (!options.skipBuild && config.build?.enabled !== false) {
        await runPreReleaseVerification(config, context, packages, rootDir);
        context.preReleaseVerified = true;
    }

    // 5. 版本管理（如果未跳过）
    let newVersion: string | undefined;
    if (!options.skipVersion) {
        // 询问是否要更新版本
        let shouldBumpVersion = true;
        if (!options.yes && config.prompts?.confirmVersion !== false) {
            shouldBumpVersion = await confirm("是否要更新版本号?", true);
        }

        if (shouldBumpVersion) {
            // 步骤 1: 显示所有将被更新的包
            const allPackagesForVersion = await discoverAllWorkspacePackages(rootDir, config);
            if (allPackagesForVersion.length > 0) {
                // 显示包列表
                showPackageList(allPackagesForVersion);

                // 确认是否继续
                if (!options.yes) {
                    const shouldContinue = await confirm(
                        `确认更新以上 ${allPackagesForVersion.length} 个包的版本号?`,
                        true,
                    );
                    if (!shouldContinue) {
                        throw new Error("已取消版本更新");
                    }
                }
            }

            // 优先检查 changeset：如果有 changeset 就使用它，否则使用其他方式
            const hasChangeset = detectChangeset(rootDir);
            const hasChangesetFiles = hasChangeset && checkHasChangesetFiles(rootDir);

            // 选择版本更新方式
            let versionUpdateMethod: VersionUpdateMethod = "changeset";
            if (!options.yes) {
                // 如果有 changeset，优先推荐使用 changeset
                const defaultMethod = hasChangeset ? "changeset" : "semver";
                const options = [
                    ...(hasChangeset
                        ? [
                              {
                                  label: "使用 changeset (推荐) - 自动根据变更文件计算版本",
                                  value: "changeset" as const,
                              },
                          ]
                        : []),
                    {
                        label: "自动检测 (semver) - 基于 Conventional Commits 自动决定版本类型",
                        value: "semver" as const,
                    },
                    {
                        label: "手动选择 - 直接指定 major/minor/patch",
                        value: "manual" as const,
                    },
                ];

                versionUpdateMethod = await select("如何更新版本号?", options, defaultMethod);
            } else {
                const strategy = config.version?.strategy || "semver";
                versionUpdateMethod = resolveNonInteractiveVersionMethod(
                    Boolean(hasChangesetFiles),
                    strategy,
                    hasChangeset,
                );
                if (versionUpdateMethod === "skip") {
                    ora().warn(t("noChangesetFilesSkip"));
                }
            }

            if (versionUpdateMethod === "skip") {
                // 跳过版本更新，继续构建与发布
            } else if (versionUpdateMethod === "manual") {
                // 手动版本更新
                let versionType: "major" | "minor" | "patch" | undefined;
                if (!options.yes) {
                    versionType = await select(
                        "选择版本类型:",
                        [
                            {
                                label: "Major (主版本号，不兼容的 API 修改)",
                                value: "major" as const,
                            },
                            {
                                label: "Minor (次版本号，向后兼容的功能新增)",
                                value: "minor" as const,
                            },
                            {
                                label: "Patch (修订号，向后兼容的问题修复)",
                                value: "patch" as const,
                            },
                        ],
                        "patch",
                    );
                } else {
                    versionType = "patch"; // 默认值
                }

                const spinner = ora("更新版本号").start();
                newVersion = await applyVersionUpdate(config, context, versionType);
                spinner.succeed(`版本已更新到 ${newVersion}`);
            } else if (versionUpdateMethod === "semver") {
                // 使用 semver 自动检测
                const spinner = ora("自动检测版本类型并更新版本号").start();
                newVersion = await applyVersionUpdate(config, context);
                spinner.succeed(`版本已自动更新到 ${newVersion}`);
            } else {
                // 使用 changeset
                if (!hasChangesetFiles) {
                    if (!options.yes) {
                        const createChangeset = await confirm("是否创建 changeset?", true);
                        if (createChangeset) {
                            const pmCommand =
                                config.project?.packageManager === "pnpm"
                                    ? "pnpm exec"
                                    : config.project?.packageManager === "yarn"
                                      ? "yarn"
                                      : "npx";
                            exec(`${pmCommand} changeset`, {
                                cwd: rootDir,
                                timeout: 5 * 60 * 1000, // 5 分钟
                                description: "创建 changeset",
                            });
                        } else {
                            throw new Error("已跳过创建 changeset");
                        }
                    } else {
                        ora().warn(t("noChangesetFilesSkip"));
                    }
                }

                if (checkHasChangesetFiles(rootDir)) {
                    const spinner = ora("应用 changeset 版本更新").start();
                    newVersion = await applyVersionUpdate(config, context);
                    spinner.succeed(`版本已更新到 ${newVersion}`);
                }
            }

            // 版本更新后的 Git 操作
            if (newVersion && config.git?.enabled !== false) {
                // 格式化代码
                const pmCommand =
                    config.project?.packageManager === "pnpm"
                        ? "pnpm"
                        : config.project?.packageManager === "yarn"
                          ? "yarn"
                          : "npm";
                const formatSpinner = ora("格式化代码（版本更新后）").start();
                try {
                    exec(`${pmCommand} format`, {
                        cwd: rootDir,
                        silent: true,
                        timeout: 5 * 60 * 1000, // 5 分钟
                        description: "格式化代码",
                    });
                    formatSpinner.succeed();
                } catch (error: unknown) {
                    abortPublishStep(formatSpinner, error, "format", t("formatFailed"));
                }

                // 提交版本更新（包括格式化后的所有更改）
                const commitSpinner = ora("提交版本更新到 Git").start();
                const commitMessage =
                    typeof config.git?.commitMessage === "function"
                        ? config.git.commitMessage(newVersion)
                        : config.git?.commitMessage;
                commitVersionUpdate(newVersion, commitMessage, true); // 传入 true 表示包含格式化后的文件
                commitSpinner.succeed();

                // 创建 Git 标签
                const tagSpinner = ora("创建 Git 标签").start();
                const tagPrefix = config.git?.tagPrefix || "v";
                createGitTag(newVersion, tagPrefix);
                tagSpinner.succeed();

                // 推送到远程
                const currentBranch = getCurrentBranch() || "main";
                if (!options.yes) {
                    const shouldPush = await confirm("是否推送到远程仓库?", true);
                    if (shouldPush) {
                        const pushSpinner = ora("推送到远程仓库").start();
                        pushToRemote(currentBranch, true);
                        pushSpinner.succeed();
                    }
                } else {
                    const pushSpinner = ora("推送到远程仓库").start();
                    pushToRemote(currentBranch, true);
                    pushSpinner.succeed();
                }

                // 使用 ora 显示版本更新完成消息，保持 CLI 设计一致性
                ora(`版本更新完成! 新版本: v${newVersion}`).succeed();
            }

            // 版本更新后，重新发现包以获取更新后的版本信息
            if (newVersion) {
                const refreshSpinner = ora("刷新包版本信息").start();
                const workspace = config.workspace;
                let refreshedPackages: typeof packages;
                if (workspace?.enabled) {
                    refreshedPackages = await discoverPackagesWithPnpm(rootDir);
                } else if (config.packages?.pattern) {
                    const patterns = Array.isArray(config.packages.pattern)
                        ? config.packages.pattern
                        : [config.packages.pattern];
                    refreshedPackages = await discoverPackagesWithPattern(rootDir, patterns);
                } else {
                    refreshedPackages = await discoverPackagesWithPnpm(rootDir);
                }

                // 应用过滤
                if (config.packages?.filter) {
                    refreshedPackages = refreshedPackages.filter(config.packages.filter);
                }

                // 验证每个包的发布配置
                const validRefreshedPackages: typeof packages = [];
                for (const pkg of refreshedPackages) {
                    const validation = validatePackageForPublish(pkg.path);
                    if (validation.valid) {
                        validRefreshedPackages.push(pkg);
                    }
                }

                packages = validRefreshedPackages;
                context.packages = packages;
                refreshSpinner.succeed("包版本信息已刷新");
            }
        }
    }

    // 6. 发布（如果未跳过）- 发布前验证已在版本更新之前完成
    if (!options.skipPublish && config.publish?.enabled !== false) {
        // 再次过滤私有包，确保不会发布私有包
        const publicPackages = packages.filter((pkg) => !pkg.private);

        if (publicPackages.length === 0) {
            ora().warn("没有可发布的公共包（所有包都是私有的）");
            return;
        }

        // 发布前再次确认构建产物（已在版本更新前构建）
        if (!options.skipBuild && config.build?.enabled !== false) {
            const verifySpinner = ora("验证构建产物").start();
            await verifyArtifacts(config, context);
            verifySpinner.succeed();
        }
        // TUI：单次检查 NPM 版本，完成后一行摘要（不逐条打 log）
        const checkSpinner = ora("检查 NPM 版本").start();
        const existingPackages: Array<{ name: string; version: string }> = [];
        for (const pkg of publicPackages) {
            const exists = checkPackageExists(pkg.name, pkg.version);
            if (exists) {
                existingPackages.push({ name: pkg.name, version: pkg.version });
            }
        }
        const newCount = publicPackages.length - existingPackages.length;
        if (existingPackages.length === 0) {
            checkSpinner.succeed(`共 ${publicPackages.length} 个包待发布`);
        } else if (newCount === 0) {
            checkSpinner.succeed(`共 ${publicPackages.length} 个包，均已存在将跳过`);
        } else {
            checkSpinner.succeed(
                `共 ${publicPackages.length} 个包，其中 ${existingPackages.length} 个已存在将跳过，${newCount} 个将发布`,
            );
        }

        if (existingPackages.length > 0 && !options.yes) {
            const shouldContinue = await confirm("是否继续? (将跳过已存在的包)", false);
            if (!shouldContinue) {
                throw new Error("已取消发布");
            }
        }

        // 确认发布
        if (!options.yes && config.prompts?.confirmPublish !== false) {
            const packageManager = config.project?.packageManager || "npm";
            const shouldPublish = await confirm(
                `确认发布 ${publicPackages.length} 个包到 NPM? (使用 ${packageManager} 发布)`,
                false,
            );
            if (!shouldPublish) {
                throw new Error("已取消发布");
            }
        }

        // 询问是否先进行 dry-run
        let shouldDryRun = options.dryRun || false;
        if (!options.yes && !options.dryRun && config.prompts?.dryRunFirst !== false) {
            shouldDryRun = await confirm("是否先进行 dry-run 测试? (推荐)", true);
        }

        if (shouldDryRun) {
            const dryRunSpinner = ora("执行 dry-run 测试").start();
            try {
                await publishPackagesDryRun(config, context);
                dryRunSpinner.succeed("dry-run 测试通过");
            } catch (error: unknown) {
                dryRunSpinner.fail("dry-run 测试失败");
                throw error;
            }

            if (!options.yes) {
                const continueAfterDryRun = await confirm("dry-run 通过，是否继续正式发布?", true);
                if (!continueAfterDryRun) {
                    throw new Error("已取消发布");
                }
            }
        }

        // 发布前提示（OTP）
        const packageManager = config.project?.packageManager || "npm";
        ora().info("📱 准备发布到 NPM");
        ora().info(`📦 使用包管理器: ${packageManager}`);
        ora().info("如果启用了 NPM 2FA，发布时会提示输入 OTP（一次性密码）");
        ora().info("请准备好您的认证器应用以获取 OTP");

        if (!options.yes) {
            const ready = await confirm("准备好发布到 NPM?（如果启用 2FA，请准备好 OTP）", true);
            if (!ready) {
                throw new Error("已取消发布");
            }
        }

        // 更新 context.packages 为只包含公共包
        context.packages = publicPackages;

        // 发布到 NPM
        const publishSpinner = ora("发布到 NPM").start();
        publishSpinner.text = "正在发布包...";
        publishSpinner.stop(); // 停止 spinner 以便显示交互式提示（OTP）

        try {
            await publishPackages(config, context);
            ora("所有包已发布到 NPM").succeed();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (
                errorMessage.includes("OTP") ||
                errorMessage.includes("one-time") ||
                errorMessage.includes("Enter one-time password") ||
                errorMessage.includes("one-time pass")
            ) {
                ora().warn("💡 提示: 发布需要 OTP 验证");
                ora().info("   请重新运行发布命令");
                ora().info("   或者在发布时准备好 OTP 并输入");
            } else {
                ora(`错误: ${errorMessage}`).fail();
            }
            throw error;
        }
    }

    // 完成
    ora("发布流程成功完成!").succeed();
    if (newVersion) {
        ora(`📦 所有包已发布到 NPM (v${newVersion})`).succeed();
        if (config.git?.enabled !== false) {
            ora(`🏷️  Git 标签已创建 (v${newVersion})`).succeed();
            ora("📝 版本更新已提交并推送").succeed();
        }
    } else {
        ora("📦 所有包已发布到 NPM").succeed();
    }
}
