/**
 * 非交互模式下版本更新策略
 */

export type VersionUpdateMethod = "changeset" | "manual" | "semver" | "skip";

/** 解析 -y 模式下的版本更新方式 */
export function resolveNonInteractiveVersionMethod(
    hasChangesetFiles: boolean,
    strategy: "changeset" | "manual" | "semver" | "custom" = "semver",
    hasChangesetDir = false,
): VersionUpdateMethod {
    if (hasChangesetFiles) {
        return "changeset";
    }

    // 无待消费 changeset：非交互模式直接跳过版本更新，继续发布
    if (strategy === "manual") {
        return "manual";
    }

    if (strategy === "semver" && !hasChangesetDir) {
        return "semver";
    }

    return "skip";
}
