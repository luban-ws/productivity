/**
 * registry 登录：已登录跳过，未登录时拉起包管理器 login
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/exec", () => ({
    execSilent: vi.fn(),
    exec: vi.fn(),
}));

import { exec, execSilent } from "../../utils/exec";
import {
    REGISTRY_LOGIN_TIMEOUT_MS,
    buildRegistryLoginCommand,
    checkNpmAuth,
    ensureNpmAuth,
} from "../auth";

const NPM_REGISTRY = "https://registry.npmjs.org/";

describe("ensureNpmAuth", () => {
    const previousLocale = process.env.SYSTEMBUG_LOCALE;
    const previousQingniaoLang = process.env.QINGNIAO_LANG;

    beforeEach(() => {
        vi.mocked(execSilent).mockReset();
        vi.mocked(exec).mockReset();
        process.env.SYSTEMBUG_LOCALE = "en";
        process.env.QINGNIAO_LANG = "en";
    });

    afterEach(() => {
        if (previousLocale === undefined) {
            delete process.env.SYSTEMBUG_LOCALE;
        } else {
            process.env.SYSTEMBUG_LOCALE = previousLocale;
        }
        if (previousQingniaoLang === undefined) {
            delete process.env.QINGNIAO_LANG;
        } else {
            process.env.QINGNIAO_LANG = previousQingniaoLang;
        }
    });

    it("已登录时不运行 login", async () => {
        vi.mocked(execSilent).mockReturnValueOnce("alice").mockReturnValueOnce(NPM_REGISTRY);
        const runLogin = vi.fn();

        const auth = await ensureNpmAuth({
            packageManager: "pnpm",
            interactive: true,
            runLogin,
        });

        expect(auth).toEqual({ username: "alice", registry: NPM_REGISTRY });
        expect(runLogin).not.toHaveBeenCalled();
        expect(execSilent).toHaveBeenNthCalledWith(1, "pnpm whoami");
    });

    it("交互终端上运行 pnpm login 后再读取用户", async () => {
        vi.mocked(execSilent)
            .mockReturnValueOnce(null)
            .mockReturnValueOnce("alice")
            .mockReturnValueOnce(NPM_REGISTRY);
        const runLogin = vi.fn();

        const auth = await ensureNpmAuth({
            packageManager: "pnpm",
            interactive: true,
            runLogin,
        });

        expect(runLogin).toHaveBeenCalledWith("pnpm login");
        expect(auth.username).toBe("alice");
    });

    it("非交互时只说明未登录，不启动 login", async () => {
        vi.mocked(execSilent).mockReturnValueOnce(null);
        const runLogin = vi.fn();

        await expect(
            ensureNpmAuth({ packageManager: "pnpm", interactive: false, runLogin }),
        ).rejects.toThrow("Not logged in to NPM");
        expect(runLogin).not.toHaveBeenCalled();
    });

    it("login 结束后仍然没有用户则失败", async () => {
        vi.mocked(execSilent).mockReturnValueOnce(null).mockReturnValueOnce(null);
        const runLogin = vi.fn();

        await expect(
            ensureNpmAuth({ packageManager: "pnpm", interactive: true, runLogin }),
        ).rejects.toThrow("pnpm login finished");
    });

    it("未注入 runLogin 时把 npm login 交给终端且不设超时", async () => {
        vi.mocked(execSilent)
            .mockReturnValueOnce(null)
            .mockReturnValueOnce("alice")
            .mockReturnValueOnce(null);

        const auth = await ensureNpmAuth({ packageManager: "npm", interactive: true });

        expect(exec).toHaveBeenCalledWith("npm login", {
            timeout: REGISTRY_LOGIN_TIMEOUT_MS,
            description: "npm login",
        });
        expect(auth.registry).toBe(NPM_REGISTRY);
    });
});

describe("buildRegistryLoginCommand", () => {
    it("yarn 使用 yarn login，未知值回落到 npm login", () => {
        expect(buildRegistryLoginCommand("yarn")).toBe("yarn login");
        expect(buildRegistryLoginCommand()).toBe("npm login");
        expect(buildRegistryLoginCommand("bun")).toBe("npm login");
    });
});

describe("checkNpmAuth", () => {
    beforeEach(() => {
        vi.mocked(execSilent).mockReset();
    });

    it("registry 命令无输出时使用默认 registry", async () => {
        vi.mocked(execSilent).mockReturnValueOnce("alice").mockReturnValueOnce(null);

        const auth = await checkNpmAuth("yarn");

        expect(auth).toEqual({ username: "alice", registry: NPM_REGISTRY });
        expect(execSilent).toHaveBeenNthCalledWith(1, "yarn whoami");
        expect(execSilent).toHaveBeenNthCalledWith(2, "yarn config get registry");
    });
});
