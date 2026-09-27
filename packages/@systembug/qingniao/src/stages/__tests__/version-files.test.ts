/**
 * skill-release.json、plugin.json 与 version.files 的版本同步
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, describe, expect, it } from "vitest";
import { bumpVersion } from "../version";
import {
    collectVersionFiles,
    discoverVersionManifestFiles,
    syncVersionFiles,
    writeJsonVersion,
} from "../version-files";

const PLUGIN_MANIFEST = {
    name: "birdify",
    version: "0.1.4",
    description: "architecture map",
};

const SKILL_RELEASE = {
    schemaVersion: 1,
    skillId: "birdify",
    channel: "stable",
    version: "0.1.4",
    source: { repository: "https://github.com/borg0ai/birdify" },
};

describe("version files", () => {
    const roots: string[] = [];

    const makeRoot = (): string => {
        const root = mkdtempSync(join(tmpdir(), "qingniao-version-files-"));
        roots.push(root);
        return root;
    };

    afterEach(() => {
        for (const root of roots.splice(0)) {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("发现嵌套 skill-release.json 与 plugin.json，并跳过 node_modules 与非清单文件", () => {
        const root = makeRoot();
        mkdirSync(join(root, "birdify"), { recursive: true });
        mkdirSync(join(root, ".claude-plugin"), { recursive: true });
        mkdirSync(join(root, "node_modules", "pkg"), { recursive: true });
        writeFileSync(join(root, "birdify", "skill-release.json"), "{}\n");
        writeFileSync(join(root, ".claude-plugin", "plugin.json"), "{}\n");
        writeFileSync(join(root, "node_modules", "pkg", "skill-release.json"), "{}\n");
        writeFileSync(join(root, "node_modules", "pkg", "plugin.json"), "{}\n");
        writeFileSync(join(root, "birdify", "SKILL.md"), "# skill\n");
        symlinkSync(join(root, "birdify", "SKILL.md"), join(root, "skill-release.json"));

        expect(discoverVersionManifestFiles(root)).toEqual([
            ".claude-plugin/plugin.json",
            "birdify/skill-release.json",
        ]);
    });

    it("目录不可读时返回空列表", () => {
        const root = makeRoot();
        writeFileSync(join(root, "not-a-dir"), "x");

        expect(discoverVersionManifestFiles(join(root, "not-a-dir"))).toEqual([]);
    });

    it("同步 skill-release.json 与额外 JSON，重复路径只写一次", () => {
        const root = makeRoot();
        const skillDir = join(root, "birdify");
        mkdirSync(skillDir, { recursive: true });
        const skillPath = join(skillDir, "skill-release.json");
        writeFileSync(skillPath, `${JSON.stringify(SKILL_RELEASE, null, 2)}\n`);
        mkdirSync(join(root, "notes"), { recursive: true });
        writeFileSync(join(root, "notes", "version.json"), '{"version":"0.0.1","name":"notes"}\n');

        const updated = syncVersionFiles(root, "0.1.5", [
            "birdify/skill-release.json",
            join(root, "notes", "version.json"),
        ]);

        expect(updated).toEqual(["birdify/skill-release.json", "notes/version.json"]);
        const skill = JSON.parse(readFileSync(skillPath, "utf-8")) as typeof SKILL_RELEASE;
        expect(skill.version).toBe("0.1.5");
        expect(skill.skillId).toBe("birdify");
        expect(skill.source.repository).toBe("https://github.com/borg0ai/birdify");
        const notes = JSON.parse(readFileSync(join(root, "notes", "version.json"), "utf-8")) as {
            version: string;
            name: string;
        };
        expect(notes).toEqual({ version: "0.1.5", name: "notes" });
    });

    it("没有清单文件时不写任何内容", () => {
        const root = makeRoot();
        expect(syncVersionFiles(root, "1.0.0")).toEqual([]);
    });

    it("拒绝跑出项目根目录的路径", () => {
        const root = makeRoot();
        expect(() => collectVersionFiles(root, ["../outside.json"])).toThrow(/项目根目录内/);
        expect(() => collectVersionFiles(root, [join(root, "..")])).toThrow(/项目根目录内/);
        expect(() => collectVersionFiles(root, [root])).toThrow(/项目根目录内/);
    });

    it("拒绝缺失、非法或非对象的版本文件", () => {
        const root = makeRoot();
        expect(() => writeJsonVersion(join(root, "missing.json"), "1.0.0")).toThrow(
            /未找到版本文件/,
        );

        const invalid = join(root, "invalid.json");
        writeFileSync(invalid, "{");
        expect(() => writeJsonVersion(invalid, "1.0.0")).toThrow(/不是合法 JSON/);

        const list = join(root, "list.json");
        writeFileSync(list, "[]\n");
        expect(() => writeJsonVersion(list, "1.0.0")).toThrow(/必须是 JSON 对象/);

        const empty = join(root, "empty.json");
        writeFileSync(empty, "null\n");
        expect(() => writeJsonVersion(empty, "1.0.0")).toThrow(/必须是 JSON 对象/);

        const text = join(root, "text.json");
        writeFileSync(text, '"nope"\n');
        expect(() => writeJsonVersion(text, "1.0.0")).toThrow(/必须是 JSON 对象/);
    });

    it("bumpVersion 同时抬升 package.json、skill-release.json 与 plugin.json", () => {
        const root = makeRoot();
        writeFileSync(
            join(root, "package.json"),
            `${JSON.stringify({ name: "birdify-monorepo", version: "0.1.4" }, null, 2)}\n`,
        );
        mkdirSync(join(root, "birdify"), { recursive: true });
        mkdirSync(join(root, ".claude-plugin"), { recursive: true });
        writeFileSync(
            join(root, "birdify", "skill-release.json"),
            `${JSON.stringify(SKILL_RELEASE, null, 2)}\n`,
        );
        writeFileSync(
            join(root, ".claude-plugin", "plugin.json"),
            `${JSON.stringify(PLUGIN_MANIFEST, null, 2)}\n`,
        );

        const next = bumpVersion(root, "patch", []);

        expect(next).toBe("0.1.5");
        const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8")) as {
            version: string;
        };
        const skill = JSON.parse(
            readFileSync(join(root, "birdify", "skill-release.json"), "utf-8"),
        ) as { version: string; skillId: string };
        const plugin = JSON.parse(
            readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf-8"),
        ) as { version: string; name: string };
        expect(pkg.version).toBe("0.1.5");
        expect(skill.version).toBe("0.1.5");
        expect(skill.skillId).toBe("birdify");
        expect(plugin.version).toBe("0.1.5");
        expect(plugin.name).toBe("birdify");
    });
});
