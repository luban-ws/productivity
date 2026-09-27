/**
 * Changesets 3：changeset version 无待发布文件时退出码 1，青鸟视为跳过。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpawnSyncReturns } from "node:child_process";

vi.mock("node:child_process", () => ({
    spawnSync: vi.fn(),
}));

import { spawnSync } from "node:child_process";
import {
    CHANGESET_NO_UNRELEASED_MESSAGE,
    isEmptyChangesetVersion,
    runChangesetVersion,
} from "../changeset-version";

function spawnResult(partial: Partial<SpawnSyncReturns<string>>): SpawnSyncReturns<string> {
    return {
        pid: 1,
        output: [],
        stdout: "",
        stderr: "",
        status: 0,
        signal: null,
        ...partial,
    };
}

describe("isEmptyChangesetVersion", () => {
    it("matches Changesets 3 empty release", () => {
        expect(isEmptyChangesetVersion(1, `warn ${CHANGESET_NO_UNRELEASED_MESSAGE}.`)).toBe(true);
    });

    it("rejects other failures and successful runs", () => {
        expect(isEmptyChangesetVersion(1, "config error")).toBe(false);
        expect(isEmptyChangesetVersion(0, CHANGESET_NO_UNRELEASED_MESSAGE)).toBe(false);
    });
});

describe("runChangesetVersion", () => {
    const previousLocale = process.env.SYSTEMBUG_LOCALE;
    const previousQingniaoLang = process.env.QINGNIAO_LANG;

    beforeEach(() => {
        vi.mocked(spawnSync).mockReset();
        process.env.SYSTEMBUG_LOCALE = "en";
        process.env.QINGNIAO_LANG = "en";
        vi.spyOn(process.stdout, "write").mockImplementation(() => true);
        vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

    it("returns applied and reprints stdout and stderr", () => {
        vi.mocked(spawnSync).mockReturnValue(
            spawnResult({ stdout: "bumped\n", stderr: "note\n", status: 0 }),
        );

        expect(runChangesetVersion("pnpm exec changeset version", "/repo")).toEqual({
            kind: "applied",
        });
        expect(process.stdout.write).toHaveBeenCalledWith("bumped\n");
        expect(process.stderr.write).toHaveBeenCalledWith("note\n");
    });

    it("returns applied when both streams are empty", () => {
        vi.mocked(spawnSync).mockReturnValue(spawnResult({ stdout: "", stderr: "", status: 0 }));

        expect(runChangesetVersion("pnpm exec changeset version", "/repo")).toEqual({
            kind: "applied",
        });
        expect(process.stdout.write).not.toHaveBeenCalled();
        expect(process.stderr.write).not.toHaveBeenCalled();
    });

    it("returns empty when Changesets 3 exits 1 with the official message", () => {
        vi.mocked(spawnSync).mockReturnValue(
            spawnResult({
                status: 1,
                stderr: `${CHANGESET_NO_UNRELEASED_MESSAGE}.\n`,
            }),
        );

        expect(runChangesetVersion("pnpm exec changeset version", "/repo")).toEqual({
            kind: "empty",
        });
    });

    it("throws when exit code 1 is a real failure", () => {
        vi.mocked(spawnSync).mockReturnValue(
            spawnResult({
                status: 1,
                stderr: "config error",
                error: { message: "ignored" } as unknown as Error,
            }),
        );

        expect(() => runChangesetVersion("pnpm exec changeset version", "/repo")).toThrow(
            /Command failed/,
        );
    });

    it("throws when the process cannot start", () => {
        vi.mocked(spawnSync).mockReturnValue(
            spawnResult({
                status: null,
                stdout: null,
                stderr: null,
                error: new Error("spawn ENOENT"),
            }),
        );

        expect(() => runChangesetVersion("pnpm exec changeset version", "/repo")).toThrow(
            /spawn ENOENT/,
        );
    });

    it("throws without command output when the failure has no text", () => {
        vi.mocked(spawnSync).mockReturnValue(
            spawnResult({ status: 2, stdout: "", stderr: "", error: undefined }),
        );

        expect(() => runChangesetVersion("pnpm exec changeset version", "/repo")).toThrow(
            /^Command failed/,
        );
    });
});
