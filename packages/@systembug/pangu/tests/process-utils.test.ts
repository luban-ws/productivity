/**
 * 子进程与信号处理工具测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import type { ChildProcess, SpawnSyncReturns } from "child_process";

const spawnSyncMock = vi.hoisted(() => vi.fn());

vi.mock("child_process", async (importOriginal) => {
    const actual = await importOriginal<typeof import("child_process")>();
    return {
        ...actual,
        spawnSync: spawnSyncMock,
    };
});

import {
    attachGracefulShutdown,
    buildPackageDevArgs,
    EXIT_CODE_SIGINT,
    EXIT_CODE_SIGTERM,
    isGracefulExitCode,
    resolvePackageDirectory,
} from "../src/process-utils.js";
import { getShutdownMessage } from "../src/messages.js";

/** 测试固定英文关闭文案（不依赖 OS） */
const EN_SHUTDOWN = getShutdownMessage("en");

function createSpawnSyncResult(
    overrides: Partial<SpawnSyncReturns<string>>,
): SpawnSyncReturns<string> {
    return {
        status: 0,
        stdout: "",
        stderr: "",
        pid: 1,
        output: [],
        signal: null,
        error: undefined,
        ...overrides,
    };
}

describe("process-utils", () => {
    beforeEach(() => {
        spawnSyncMock.mockReset();
    });

    describe("isGracefulExitCode", () => {
        it("应将 null、0、130、143 视为优雅退出", () => {
            expect(isGracefulExitCode(null)).toBe(true);
            expect(isGracefulExitCode(0)).toBe(true);
            expect(isGracefulExitCode(EXIT_CODE_SIGINT)).toBe(true);
            expect(isGracefulExitCode(EXIT_CODE_SIGTERM)).toBe(true);
        });

        it("应将其他非零退出码视为失败", () => {
            expect(isGracefulExitCode(1)).toBe(false);
            expect(isGracefulExitCode(127)).toBe(false);
        });
    });

    describe("buildPackageDevArgs", () => {
        it("无额外参数时应默认使用 dev", () => {
            expect(buildPackageDevArgs([])).toEqual(["dev"]);
        });

        it("有额外参数时应原样返回", () => {
            expect(buildPackageDevArgs(["run", "dev", "--", "--port", "3000"])).toEqual([
                "run",
                "dev",
                "--",
                "--port",
                "3000",
            ]);
        });
    });

    describe("resolvePackageDirectory", () => {
        it("应返回 pnpm exec 解析出的包目录", () => {
            spawnSyncMock.mockReturnValue(
                createSpawnSyncResult({
                    status: 0,
                    stdout: "/workspace/packages/site\n",
                }),
            );

            const directory = resolvePackageDirectory("@demo/site", "pnpm", "/workspace");

            expect(directory).toBe("/workspace/packages/site");
            expect(spawnSyncMock).toHaveBeenCalledWith(
                "pnpm",
                ["--filter", "@demo/site", "exec", "node", "-p", "process.cwd()"],
                { cwd: "/workspace", encoding: "utf-8" },
            );
        });

        it("解析失败时应抛出包含 stderr 的错误", () => {
            spawnSyncMock.mockReturnValue(
                createSpawnSyncResult({
                    status: 1,
                    stderr: "filter not found",
                }),
            );

            expect(() => resolvePackageDirectory("@missing/pkg", "pnpm", "/workspace")).toThrow(
                /@missing\/pkg.*filter not found/,
            );
        });

        it("无 stdout 时应抛出通用错误", () => {
            spawnSyncMock.mockReturnValue(createSpawnSyncResult({ status: 0, stdout: "" }));

            expect(() => resolvePackageDirectory("@empty/pkg", "pnpm", "/workspace")).toThrow(
                /@empty\/pkg/,
            );
        });
    });

    describe("attachGracefulShutdown", () => {
        let childProcess: ChildProcess;
        let exitSpy: ReturnType<typeof vi.spyOn>;
        let logSpy: ReturnType<typeof vi.spyOn>;
        let errorSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            childProcess = new EventEmitter() as ChildProcess;
            childProcess.kill = vi.fn();
            exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
            logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
            errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        });

        afterEach(() => {
            process.removeAllListeners("SIGINT");
            process.removeAllListeners("SIGTERM");
            vi.restoreAllMocks();
        });

        it("SIGINT 后子进程退出 130 时应以 0 结束", () => {
            attachGracefulShutdown(childProcess, { message: EN_SHUTDOWN });

            process.emit("SIGINT");
            childProcess.emit("exit", EXIT_CODE_SIGINT);

            expect(childProcess.kill).toHaveBeenCalledWith("SIGINT");
            expect(logSpy).toHaveBeenCalledWith(EN_SHUTDOWN);
            expect(exitSpy).toHaveBeenCalledWith(0);
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it("应使用默认 shutdown 文案", () => {
            attachGracefulShutdown(childProcess);

            process.emit("SIGINT");

            expect(logSpy).toHaveBeenCalledWith(getShutdownMessage("en"));
        });

        it("子进程 exit null 时应以 0 结束", () => {
            attachGracefulShutdown(childProcess);

            childProcess.emit("exit", null);

            expect(exitSpy).toHaveBeenCalledWith(0);
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it("子进程 exit undefined 时应 exit 0", () => {
            attachGracefulShutdown(childProcess);

            childProcess.emit("exit", undefined);

            expect(errorSpy).not.toHaveBeenCalled();
            expect(exitSpy).toHaveBeenCalledWith(0);
        });

        it("解析失败无 stderr 时应走无 stderr 分支", () => {
            spawnSyncMock.mockReturnValue(
                createSpawnSyncResult({
                    status: 1,
                    stdout: "",
                    stderr: "",
                }),
            );

            expect(() => resolvePackageDirectory("@empty/pkg", "pnpm", "/workspace")).toThrow(
                /resolve package directory/i,
            );
        });

        it("重复 SIGINT 时不应重复 kill", () => {
            attachGracefulShutdown(childProcess);

            process.emit("SIGINT");
            process.emit("SIGINT");

            expect(childProcess.kill).toHaveBeenCalledTimes(1);
        });

        it("非优雅退出码时应 exit 0 避免 pnpm ELIFECYCLE", () => {
            attachGracefulShutdown(childProcess);

            childProcess.emit("exit", 1);

            expect(errorSpy).not.toHaveBeenCalled();
            expect(exitSpy).toHaveBeenCalledWith(0);
        });

        it("shuttingDown 后即使非零退出码也应以 0 结束", () => {
            attachGracefulShutdown(childProcess);

            process.emit("SIGTERM");
            childProcess.emit("exit", 1);

            expect(childProcess.kill).toHaveBeenCalledWith("SIGTERM");
            expect(exitSpy).toHaveBeenCalledWith(0);
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it("应支持自定义关闭提示", () => {
            attachGracefulShutdown(childProcess, { message: "custom shutdown" });

            process.emit("SIGINT");

            expect(logSpy).toHaveBeenCalledWith("custom shutdown");
        });
    });
});
