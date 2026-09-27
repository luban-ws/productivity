/**
 * 调用 changeset version，并识别 Changesets 3 的空发布退出码。
 * v2 在没有待发布 changeset 时退出 0；v3 退出 1，文案不变。
 */

import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { t } from "../messages.js";

/** Changesets CLI 在没有待发布 changeset 时打印的原文 */
export const CHANGESET_NO_UNRELEASED_MESSAGE = "No unreleased changesets found";

const CHANGESET_VERSION_TIMEOUT_MS = 5 * 60 * 1000;

export type ChangesetVersionRun = { kind: "applied" } | { kind: "empty" };

/** 退出码 1 且输出包含官方空发布文案时，版本步骤是空操作 */
export function isEmptyChangesetVersion(exitCode: number, output: string): boolean {
    return exitCode === 1 && output.includes(CHANGESET_NO_UNRELEASED_MESSAGE);
}

function combinedOutput(result: SpawnSyncReturns<string>): string {
    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    const spawnMessage = result.error instanceof Error ? result.error.message : "";
    return [stdout, stderr, spawnMessage].filter((part) => part.length > 0).join("\n");
}

function writeCaptured(result: SpawnSyncReturns<string>): void {
    if (result.stdout) {
        process.stdout.write(result.stdout);
    }
    if (result.stderr) {
        process.stderr.write(result.stderr);
    }
}

/**
 * 运行版本命令。空发布返回 empty，其它非 0 退出码抛出。
 */
export function runChangesetVersion(command: string, cwd: string): ChangesetVersionRun {
    const result = spawnSync(command, {
        cwd,
        shell: true,
        encoding: "utf-8",
        timeout: CHANGESET_VERSION_TIMEOUT_MS,
    });
    writeCaptured(result);
    const exitCode = result.status ?? 1;
    const output = combinedOutput(result);
    if (exitCode === 0) {
        return { kind: "applied" };
    }
    if (isEmptyChangesetVersion(exitCode, output)) {
        return { kind: "empty" };
    }
    const withOutput = output.length > 0 ? `\n${t("commandOutput")}\n${output}` : "";
    throw new Error(
        `${t("commandFailed")}\n${t("commandDetails", {
            command,
            cwd,
            seconds: CHANGESET_VERSION_TIMEOUT_MS / 1000,
        })}${withOutput}`,
    );
}
