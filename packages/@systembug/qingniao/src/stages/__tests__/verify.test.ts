import { describe, it, expect, vi, beforeEach } from "vitest";
import { runPreReleaseVerification } from "../verify";
import type { Context, PublishConfig } from "../../types";

vi.mock("../build", () => ({
    executeBuildSteps: vi.fn().mockResolvedValue(undefined),
    verifyArtifacts: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../utils/exec", () => ({
    exec: vi.fn(),
}));

vi.mock("../../utils/package", () => ({
    discoverAllPackagesWithPnpm: vi.fn().mockResolvedValue([]),
}));

import { exec } from "../../utils/exec";
import { executeBuildSteps, verifyArtifacts } from "../build";

describe("runPreReleaseVerification", () => {
    const rootDir = "/tmp/repo";
    const packages = [{ name: "@scope/pkg", version: "1.0.0", path: "/tmp/repo/packages/pkg" }];
    const config: PublishConfig = {
        project: { packageManager: "pnpm" },
        checks: { lint: true, format: true, typecheck: true, tests: true },
        build: { enabled: true },
    };
    const context: Context = {
        packages,
        config,
        rootDir,
    };

    beforeEach(() => {
        vi.mocked(exec).mockReset();
        vi.mocked(executeBuildSteps).mockClear();
        vi.mocked(verifyArtifacts).mockClear();
    });

    it("在版本更新前应依次运行 install、lint、format:check、typecheck、test、build", async () => {
        await runPreReleaseVerification(config, context, packages, rootDir);

        const calls = vi.mocked(exec).mock.calls.map(([cmd]) => cmd);
        expect(calls[0]).toBe("pnpm install --frozen-lockfile");
        expect(calls).toContain("pnpm lint");
        expect(calls).toContain("pnpm format:check");
        expect(calls).toContain("pnpm typecheck");
        expect(calls).toContain("pnpm test");
        expect(executeBuildSteps).toHaveBeenCalledOnce();
        expect(verifyArtifacts).toHaveBeenCalledOnce();
    });

    it("lint 失败时应中止并抛出错误", async () => {
        vi.mocked(exec).mockImplementation((cmd: string) => {
            if (cmd === "pnpm lint") {
                throw new Error("Command failed with exit code 1");
            }
        });

        await expect(
            runPreReleaseVerification(config, context, packages, rootDir),
        ).rejects.toThrow();
    });
});
