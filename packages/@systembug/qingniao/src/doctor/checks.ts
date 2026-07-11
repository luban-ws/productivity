/**
 * doctor 诊断项收集
 */

import { existsSync } from "fs";
import { join } from "path";
import type { PublishConfig } from "../types";
import { checkNpmAuth } from "../stages/auth";
import { getCurrentBranch, hasUncommittedChanges, hasUnpushedCommits } from "../stages/git";
import {
    detectChangeset,
    detectPackageManager,
    detectWorkspace,
    hasChangesetFiles,
} from "../utils/auto-detect";
import {
    discoverPackagesWithPnpm,
    readPackageJson,
    validatePackageForPublish,
} from "../utils/package";
import { hasFormatCheckScript, hasRootScript, RELEASE_SCRIPT_NAME } from "../utils/root-scripts";
import { t } from "../messages.js";
import type { DoctorFinding } from "./types";

function ok(id: string, category: string, message: string): DoctorFinding {
    return { id, severity: "ok", category, message, fixable: false };
}

function warn(
    id: string,
    category: string,
    message: string,
    hint?: string,
    fixable = false,
): DoctorFinding {
    return { id, severity: "warn", category, message, hint, fixable };
}

function error(
    id: string,
    category: string,
    message: string,
    hint?: string,
    fixable = false,
): DoctorFinding {
    return { id, severity: "error", category, message, hint, fixable };
}

/** 收集发布前诊断项 */
export async function collectDoctorFindings(
    rootDir: string,
    config: PublishConfig,
): Promise<DoctorFinding[]> {
    const findings: DoctorFinding[] = [];
    const pm = config.project?.packageManager ?? detectPackageManager(rootDir) ?? "pnpm";
    const doctorFix = t("doctorFixHint");

    if (config.checks?.auth !== false) {
        const auth = await checkNpmAuth(pm);
        if (auth) {
            findings.push(ok("npm-auth", "NPM", t("npmLoggedIn", { username: auth.username })));
            if (!auth.registry.includes("npmjs.org")) {
                findings.push(
                    warn(
                        "npm-registry",
                        "NPM",
                        t("npmRegistry", { registry: auth.registry }),
                        t("npmRegistryHint"),
                    ),
                );
            }
        } else {
            findings.push(
                error("npm-auth", "NPM", t("npmNotLoggedIn"), t("npmLoginHint", { pm }), false),
            );
        }
    }

    if (config.checks?.git !== false && config.git?.enabled !== false) {
        const branch = getCurrentBranch();
        if (!branch) {
            findings.push(error("git-repo", "Git", t("gitNotRepo")));
        } else {
            findings.push(ok("git-branch", "Git", t("gitBranch", { branch })));
            if (config.git?.requireClean !== false && hasUncommittedChanges()) {
                findings.push(warn("git-dirty", "Git", t("gitDirty"), t("gitDirtyHint")));
            } else {
                findings.push(ok("git-clean", "Git", t("gitClean")));
            }
            if (config.git?.requireUpToDate !== false && hasUnpushedCommits(branch)) {
                findings.push(warn("git-unpushed", "Git", t("gitUnpushed"), t("gitUnpushedHint")));
            }
        }
    }

    const workspace = detectWorkspace(rootDir);
    if (workspace.type) {
        findings.push(
            ok("workspace", "Workspace", t("workspaceDetected", { type: workspace.type })),
        );
    } else {
        findings.push(warn("workspace", "Workspace", t("workspaceMissing")));
    }

    const publishable = await discoverPackagesWithPnpm(rootDir);
    if (publishable.length === 0) {
        findings.push(error("packages", "Packages", t("packagesNone")));
    } else {
        findings.push(
            ok("packages", "Packages", t("packagesCount", { count: publishable.length })),
        );
        for (const pkg of publishable) {
            const validation = validatePackageForPublish(pkg.path);
            for (const msg of validation.errors) {
                findings.push(error(`pkg-${pkg.name}`, pkg.name, msg));
            }
            for (const msg of validation.warnings) {
                findings.push(warn(`pkg-${pkg.name}`, pkg.name, msg));
            }
        }
    }

    const rootPkg = readPackageJson(rootDir);
    const devDeps =
        rootPkg && typeof rootPkg.devDependencies === "object" && rootPkg.devDependencies !== null
            ? (rootPkg.devDependencies as Record<string, string>)
            : {};

    if (config.checks?.lint !== false && !hasRootScript(rootDir, "lint")) {
        findings.push(error("script-lint", "Scripts", t("scriptLintMissing"), doctorFix, true));
    } else if (config.checks?.lint !== false) {
        findings.push(ok("script-lint", "Scripts", t("scriptLintOk")));
    }

    if (config.checks?.format !== false && !hasRootScript(rootDir, "format")) {
        findings.push(error("script-format", "Scripts", t("scriptFormatMissing"), doctorFix, true));
    } else if (config.checks?.format !== false) {
        findings.push(ok("script-format", "Scripts", t("scriptFormatOk")));
    }

    if (config.checks?.format !== false && !hasFormatCheckScript(rootDir)) {
        findings.push(
            error("script-format-check", "Scripts", t("scriptFormatCheckMissing"), doctorFix, true),
        );
    } else if (config.checks?.format !== false) {
        findings.push(ok("script-format-check", "Scripts", t("scriptFormatCheckOk")));
    }

    if (config.checks?.typecheck !== false && !hasRootScript(rootDir, "typecheck")) {
        findings.push(
            error("script-typecheck", "Scripts", t("scriptTypecheckMissing"), doctorFix, true),
        );
    } else if (config.checks?.typecheck !== false) {
        findings.push(ok("script-typecheck", "Scripts", t("scriptTypecheckOk")));
    }

    if (config.checks?.tests !== false && !hasRootScript(rootDir, "test")) {
        findings.push(error("script-test", "Scripts", t("scriptTestMissing"), doctorFix, true));
    } else if (config.checks?.tests !== false) {
        findings.push(ok("script-test", "Scripts", t("scriptTestOk")));
    }

    if (config.checks?.build !== false && !hasRootScript(rootDir, "build")) {
        findings.push(error("script-build", "Scripts", t("scriptBuildMissing"), doctorFix, true));
    } else if (config.checks?.build !== false) {
        findings.push(ok("script-build", "Scripts", t("scriptBuildOk")));
    }

    if (!hasRootScript(rootDir, RELEASE_SCRIPT_NAME)) {
        findings.push(
            warn(
                "script-release",
                "Scripts",
                t("scriptReleaseMissing", { script: RELEASE_SCRIPT_NAME }),
                doctorFix,
                true,
            ),
        );
    } else {
        findings.push(ok("script-release", "Scripts", t("scriptReleaseOk")));
    }

    if (detectChangeset(rootDir)) {
        findings.push(ok("changeset-dir", "Changeset", t("changesetDirOk")));
        if (!hasChangesetFiles(rootDir)) {
            findings.push(
                warn(
                    "changeset-pending",
                    "Changeset",
                    t("changesetPendingNone"),
                    t("changesetPendingHint"),
                ),
            );
        } else {
            findings.push(ok("changeset-pending", "Changeset", t("changesetPendingOk")));
        }
    } else {
        findings.push(
            warn("changeset-dir", "Changeset", t("changesetDirMissing"), doctorFix, true),
        );
    }

    if (!devDeps["@changesets/cli"]) {
        findings.push(
            warn(
                "dep-changesets",
                "Dependencies",
                t("depChangesetsMissing"),
                t("depChangesetsHint", { pm }),
                false,
            ),
        );
    } else {
        findings.push(ok("dep-changesets", "Dependencies", t("depChangesetsOk")));
    }

    const qingniaoConfig = join(rootDir, "qingniao.config.json");
    if (!existsSync(qingniaoConfig)) {
        findings.push(warn("qingniao-config", "Config", t("configMissing"), doctorFix, true));
    } else {
        findings.push(ok("qingniao-config", "Config", t("configOk")));
    }

    return findings;
}

/** 是否存在 error 级问题 */
export function hasDoctorErrors(findings: DoctorFinding[], strict = false): boolean {
    if (findings.some((f) => f.severity === "error")) {
        return true;
    }
    return strict && findings.some((f) => f.severity === "warn");
}
