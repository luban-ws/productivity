/**
 * changeset version 空发布时保持当前版本，不改 package.json。
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../changeset-version", () => ({
    runChangesetVersion: vi.fn(),
}));

import { runChangesetVersion } from "../changeset-version";
import { bumpVersionWithChangeset } from "../version";

describe("bumpVersionWithChangeset empty release", () => {
    const dirs: string[] = [];

    afterEach(() => {
        vi.mocked(runChangesetVersion).mockReset();
        for (const dir of dirs) {
            rmSync(dir, { recursive: true, force: true });
        }
        dirs.length = 0;
    });

    function repo(): string {
        const dir = mkdtempSync(join(tmpdir(), "qingniao-cs-"));
        writeFileSync(join(dir, "package.json"), JSON.stringify({ version: "1.2.3" }));
        dirs.push(dir);
        return dir;
    }

    it("keeps the current version when Changesets reports nothing to release", async () => {
        vi.mocked(runChangesetVersion).mockReturnValue({ kind: "empty" });
        const rootDir = repo();

        await expect(
            bumpVersionWithChangeset(rootDir, { project: { packageManager: "pnpm" } }),
        ).resolves.toBe("1.2.3");
        expect(runChangesetVersion).toHaveBeenCalledWith("pnpm exec changeset version", rootDir);
    });

    it("uses yarn or npx and a custom version command", async () => {
        vi.mocked(runChangesetVersion).mockReturnValue({ kind: "empty" });
        const yarnRoot = repo();
        const npmRoot = repo();
        const customRoot = repo();

        await bumpVersionWithChangeset(yarnRoot, { project: { packageManager: "yarn" } });
        await bumpVersionWithChangeset(npmRoot, { project: { packageManager: "npm" } });
        await bumpVersionWithChangeset(customRoot, {
            changeset: { versionCommand: "pnpm exec changeset version --snapshot beta" },
        });

        expect(runChangesetVersion).toHaveBeenNthCalledWith(1, "yarn changeset version", yarnRoot);
        expect(runChangesetVersion).toHaveBeenNthCalledWith(2, "npx changeset version", npmRoot);
        expect(runChangesetVersion).toHaveBeenNthCalledWith(
            3,
            "pnpm exec changeset version --snapshot beta",
            customRoot,
        );
    });
});
