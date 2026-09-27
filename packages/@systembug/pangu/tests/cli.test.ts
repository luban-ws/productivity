/**
 * CLI 逻辑主流程测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import type { ChildProcess } from "child_process";
import { DemoSelectCancelledError } from "../src/ui/demo-select-errors.js";
import { StartupFailedError } from "../src/ui/startup-types.js";

const spawnDevScriptMock = vi.hoisted(() => vi.fn());
const readDevScriptMock = vi.hoisted(() => vi.fn());
const loadConfigMock = vi.hoisted(() => vi.fn());
const getDemoOptionsMock = vi.hoisted(() => vi.fn());
const runDemoSelectMock = vi.hoisted(() => vi.fn());
const runHelpUntilExitMock = vi.hoisted(() => vi.fn());
const runAlertMock = vi.hoisted(() => vi.fn());
const runInvalidDemoScreenMock = vi.hoisted(() => vi.fn());
const runStartupMock = vi.hoisted(() => vi.fn());
const attachGracefulShutdownMock = vi.hoisted(() => vi.fn());
const resolvePackageDirectoryMock = vi.hoisted(() => vi.fn());

vi.mock("../src/config.js", () => ({
    loadConfig: loadConfigMock,
    getDemoOptions: getDemoOptionsMock,
}));

vi.mock("../src/ui/run-demo-select.js", () => ({
    runDemoSelect: runDemoSelectMock,
}));

vi.mock("../src/ui/run-help.js", () => ({
    runHelpUntilExit: runHelpUntilExitMock,
}));

vi.mock("../src/ui/run-alert.js", () => ({
    runAlert: runAlertMock,
}));

vi.mock("../src/ui/run-invalid-demo.js", () => ({
    runInvalidDemoScreen: runInvalidDemoScreenMock,
}));

vi.mock("../src/ui/run-startup.js", () => ({
    runStartup: runStartupMock,
}));

vi.mock("../src/process-utils.js", () => ({
    appendDevArgs: (script: string, extraArgs: string[]) =>
        extraArgs.length > 0 ? [script, ...extraArgs].join(" ") : script,
    attachGracefulShutdown: attachGracefulShutdownMock,
    buildDevEnv: () => ({ PATH: "/bin" }),
    readDevScript: readDevScriptMock,
    resolvePackageDirectory: resolvePackageDirectoryMock,
    spawnDevScript: spawnDevScriptMock,
}));

import { main } from "../src/cli.js";
import { DEFAULT_SUPPORTED_BY } from "../src/constants.js";

const DEMOS = [
    {
        name: "Site",
        value: "site",
        description: "Site demo",
        package: "@systembug/site",
    },
];

describe("cli main", () => {
    let originalArgv: string[];
    let exitSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        originalArgv = process.argv;
        exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
        runAlertMock.mockReset().mockResolvedValue(undefined);
        runInvalidDemoScreenMock.mockReset().mockResolvedValue(undefined);
        runDemoSelectMock.mockReset().mockResolvedValue("site");
        runHelpUntilExitMock.mockReset();
        spawnDevScriptMock.mockReset();
        readDevScriptMock.mockReset().mockReturnValue("vite");
        attachGracefulShutdownMock.mockReset();
        resolvePackageDirectoryMock.mockReset().mockReturnValue("/workspace/packages/site");
        runStartupMock.mockReset().mockResolvedValue({
            packageDirectory: "/workspace/packages/site",
            command: "pnpm dev",
            packageManager: "pnpm",
            packageName: "@systembug/site",
        });
        loadConfigMock.mockReset().mockReturnValue({
            projectName: "TestProject",
            packageManager: "pnpm",
        });
        getDemoOptionsMock.mockReset().mockReturnValue(DEMOS);

        const childProcess = new EventEmitter() as ChildProcess;
        spawnDevScriptMock.mockReturnValue(childProcess);
    });

    afterEach(() => {
        process.argv = originalArgv;
        vi.restoreAllMocks();
    });

    it("无 demo 时应告警并退出", async () => {
        getDemoOptionsMock.mockReturnValue([]);
        process.argv = ["node", "pangu"];

        await main();

        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" }));
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("传入 -h 应展示帮助并以 0 退出", async () => {
        process.argv = ["node", "pangu", "-h"];

        await main();

        expect(runHelpUntilExitMock).toHaveBeenCalledWith(DEMOS, "pnpm");
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("config 无 projectName 和 packageManager 时应使用默认值", async () => {
        loadConfigMock.mockReturnValue({});
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockResolvedValue("site");

        await main();

        expect(runDemoSelectMock).toHaveBeenCalledWith(DEFAULT_SUPPORTED_BY, DEMOS);
        expect(runStartupMock).toHaveBeenCalledWith(
            expect.objectContaining({ packageManager: "pnpm" }),
        );
    });

    it("startDevServer 发生非 StartupFailedError 异常时应向外抛出并在外层捕获", async () => {
        process.argv = ["node", "pangu", "site"];
        runStartupMock.mockRejectedValue(new Error("unexpected startup crash"));

        await main();

        expect(runAlertMock).toHaveBeenCalledWith(
            expect.objectContaining({
                variant: "error",
                title: expect.anything(),
            }),
        );
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("传入有效 demo 名称应直接启动该 demo", async () => {
        process.argv = ["node", "pangu", "site", "--port", "3000"];

        await main();

        expect(runStartupMock).toHaveBeenCalledWith(
            expect.objectContaining({ command: "vite --port 3000" }),
        );
        expect(spawnDevScriptMock).toHaveBeenCalledWith(
            "vite --port 3000",
            "/workspace/packages/site",
            { PATH: "/bin" },
        );
        expect(attachGracefulShutdownMock).toHaveBeenCalled();
    });

    it("传入无效 demo 名称应展示 invalid demo 屏并退出", async () => {
        process.argv = ["node", "pangu", "unknown-demo"];

        await main();

        expect(runInvalidDemoScreenMock).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("无参数时应唤起交互式选择并启动所选 demo", async () => {
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockResolvedValue("site");

        await main();

        expect(runDemoSelectMock).toHaveBeenCalledWith("TestProject", DEMOS);
        expect(runStartupMock).toHaveBeenCalledWith(expect.objectContaining({ command: "vite" }));
        expect(spawnDevScriptMock).toHaveBeenCalledWith("vite", "/workspace/packages/site", {
            PATH: "/bin",
        });
        expect(attachGracefulShutdownMock).toHaveBeenCalled();
    });

    it("取消选择时应展示 info 取消提示并以 0 退出", async () => {
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockRejectedValue(new DemoSelectCancelledError());

        await main();

        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "info" }));
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("启动失败（StartupFailedError）时应以 0 退出", async () => {
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockResolvedValue("site");
        runStartupMock.mockRejectedValue(new StartupFailedError("failed"));

        await main();

        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("子进程发生 error 事件时应展示错误告警并退出", async () => {
        process.argv = ["node", "pangu", "site"];
        const childProcess = new EventEmitter() as ChildProcess;
        spawnDevScriptMock.mockReturnValue(childProcess);

        await main();

        childProcess.emit("error", new Error("spawn ENOENT"));
        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" }));
    });

    it("传入包含自定义 packageManager 与 args 的 demo 应正确拼接启动", async () => {
        const customDemo = {
            name: "App",
            value: "app",
            package: "@systembug/app",
            packageManager: "npm",
            args: ["run", "dev"],
        };
        getDemoOptionsMock.mockReturnValue([customDemo]);
        process.argv = ["node", "pangu", "app"];
        resolvePackageDirectoryMock.mockReturnValue("/workspace/packages/app");

        runStartupMock.mockImplementation(async (opts: { resolveDirectory: () => string }) => {
            opts.resolveDirectory();
            return {
                packageDirectory: "/workspace/packages/app",
                command: "npm run dev",
                packageManager: "npm",
                packageName: "@systembug/app",
            };
        });

        await main();

        expect(readDevScriptMock).toHaveBeenCalledWith("/workspace/packages/app");
        expect(spawnDevScriptMock).toHaveBeenCalledWith("vite run dev", "/workspace/packages/app", {
            PATH: "/bin",
        });
    });

    it("交互选择返回不存在的 option 时应报错并退出", async () => {
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockResolvedValue("non-existent");

        await main();

        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" }));
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("子进程发生非 Error 类型的 error 事件时应正确格式化", async () => {
        process.argv = ["node", "pangu", "site"];
        const childProcess = new EventEmitter() as ChildProcess;
        spawnDevScriptMock.mockReturnValue(childProcess);

        await main();

        childProcess.emit("error", "string error");
        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" }));
    });

    it("发生其他未知异常时应展示错误并退出", async () => {
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockRejectedValue(new Error("unexpected crash"));

        await main();

        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" }));
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("发生非 Error 对象的未知异常时应展示错误并退出", async () => {
        process.argv = ["node", "pangu"];
        runDemoSelectMock.mockRejectedValue("string failure");

        await main();

        expect(runAlertMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "error" }));
        expect(exitSpy).toHaveBeenCalledWith(0);
    });
});
