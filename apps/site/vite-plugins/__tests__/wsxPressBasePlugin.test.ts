import { describe, expect, it } from "vitest";
import { transformWsxPressClient } from "../wsxPressBasePlugin";

describe("transformWsxPressClient", () => {
    it("no-ops when base is root", () => {
        const code = 'fetch("/.wsx-press/docs-meta.json")';
        expect(transformWsxPressClient(code, "/")).toBeNull();
    });

    it("prefixes wsx-press and docs fetch paths", () => {
        const code = [
            'fetch("/.wsx-press/docs-meta.json")',
            "const C = `/docs/${r}.md`",
            'if (e.path.startsWith("/docs/"))\n        r = e.path.slice(6);',
        ].join("\n");

        const out = transformWsxPressClient(code, "/productivity/");
        expect(out).toContain('fetch("/productivity/.wsx-press/docs-meta.json")');
        expect(out).toContain("`/productivity/docs/${r}.md`");
        expect(out).toContain('if (e.path.includes("/docs/"))');
        expect(out).toContain('e.path.split("/docs/")[1]');
    });
});
