/**
 * exec 函数测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { exec, execSilent } from "../exec";
import { execSync } from "child_process";

// Mock child_process
vi.mock("child_process", () => {
    const actual = vi.importActual<typeof import("child_process")>("child_process");
    return {
        ...actual,
        execSync: vi.fn(),
    };
});

describe("exec", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("应该成功执行命令", () => {
        // execSync 在设置了 encoding 时返回字符串
        (execSync as vi.Mock).mockReturnValue("success");
        const result = exec("echo test");
        expect(result).toBe("success");
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            stdio: "inherit",
            encoding: "utf-8",
        }));
    });

    test("应该支持 silent 选项", () => {
        (execSync as vi.Mock).mockReturnValue("output");
        exec("echo test", { silent: true });
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            stdio: "pipe",
        }));
    });

    test("应该支持自定义工作目录", () => {
        (execSync as vi.Mock).mockReturnValue("output");
        exec("echo test", { cwd: "/custom/path" });
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            cwd: "/custom/path",
        }));
    });

    test("应该支持超时选项", () => {
        (execSync as vi.Mock).mockReturnValue("output");
        exec("echo test", { timeout: 5000 });
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            timeout: 5000,
        }));
    });

    test("应该支持 description 选项", () => {
        (execSync as vi.Mock).mockReturnValue("output");
        exec("echo test", { description: "测试命令" });
        expect(execSync).toHaveBeenCalled();
    });

    test("应该在命令失败时抛出错误并包含上下文", () => {
        const error = new Error("Command failed");
        (execSync as vi.Mock).mockImplementation(() => {
            throw error;
        });

        expect(() => {
            exec("failing-command", { description: "失败的命令" });
        }).toThrow("命令执行失败");
    });

    test("应该在超时时提供详细的错误信息", () => {
        const error = new Error("ETIMEDOUT");
        (execSync as vi.Mock).mockImplementation(() => {
            throw error;
        });

        expect(() => {
            exec("slow-command", { timeout: 1000, description: "慢命令" });
        }).toThrow("命令执行超时");
    });

    test("应该在命令未找到时提供帮助信息", () => {
        const error = new Error("ENOENT: command not found");
        (execSync as vi.Mock).mockImplementation(() => {
            throw error;
        });

        expect(() => {
            exec("nonexistent-command");
        }).toThrow("命令未找到");
    });

    test("应该使用默认超时（30分钟）", () => {
        (execSync as vi.Mock).mockReturnValue("output");
        exec("echo test");
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            timeout: 30 * 60 * 1000,
        }));
    });

    test("应该支持 timeout 为 0（无超时）", () => {
        (execSync as vi.Mock).mockReturnValue("output");
        exec("echo test", { timeout: 0 });
        const callArgs = (execSync as vi.Mock).mock.calls[0][1] as Record<string, unknown>;
        expect(callArgs.timeout).toBeUndefined();
    });

    test("错误消息应该包含命令、工作目录和描述", () => {
        const error = new Error("Command failed");
        (execSync as vi.Mock).mockImplementation(() => {
            throw error;
        });

        try {
            exec("test-command", {
                cwd: "/test/dir",
                description: "测试描述",
            });
            expect.fail("应该抛出错误");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            expect(errorMessage).toContain("test-command");
            expect(errorMessage).toContain("/test/dir");
            expect(errorMessage).toContain("测试描述");
        }
    });
});

describe("execSilent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("应该成功执行命令并返回输出", () => {
        (execSync as vi.Mock).mockReturnValue(Buffer.from("  output  "));
        const result = execSilent("echo test");
        expect(result).toBe("output");
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            stdio: "pipe",
        }));
    });

    test("应该在命令失败时返回 null", () => {
        (execSync as vi.Mock).mockImplementation(() => {
            throw new Error("Command failed");
        });
        const result = execSilent("failing-command");
        expect(result).toBeNull();
    });

    test("应该支持自定义工作目录", () => {
        (execSync as vi.Mock).mockReturnValue(Buffer.from("output"));
        execSilent("echo test", { cwd: "/custom/path" });
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            cwd: "/custom/path",
        }));
    });

    test("应该支持自定义编码", () => {
        (execSync as vi.Mock).mockReturnValue(Buffer.from("output"));
        execSilent("echo test", { encoding: "utf-8" });
        expect(execSync).toHaveBeenCalledWith("echo test", expect.objectContaining({
            encoding: "utf-8",
        }));
    });
});
