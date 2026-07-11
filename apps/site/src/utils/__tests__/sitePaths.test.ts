import { describe, expect, it } from "vitest";
import { sitePathWithBase } from "../../sitePaths";

describe("sitePathWithBase", () => {
    it("returns root for empty route at site root", () => {
        expect(sitePathWithBase("/", "/")).toBe("/");
        expect(sitePathWithBase("/", "")).toBe("/");
    });

    it("prefixes routes under subpath base", () => {
        expect(sitePathWithBase("/productivity/", "/")).toBe("/productivity/");
        expect(sitePathWithBase("/productivity/", "/docs/productivity")).toBe(
            "/productivity/docs/productivity",
        );
        expect(sitePathWithBase("/productivity/", "/docs/*")).toBe("/productivity/docs/*");
    });

    it("handles base without trailing slash", () => {
        expect(sitePathWithBase("/productivity", "/docs/tools/ai-prompt")).toBe(
            "/productivity/docs/tools/ai-prompt",
        );
    });

    it("joins route segments without double slashes", () => {
        expect(sitePathWithBase("/", "/docs/foo")).toBe("/docs/foo");
    });
});
