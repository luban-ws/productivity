import { describe, expect, it } from "vitest";
import {
    DOCS_ROUTE_PREFIX,
    getDocsRelativePath,
    isDocsAppPath,
    sitePathWithBase,
    stripSiteBaseWithBase,
} from "../../sitePaths";

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
});

describe("stripSiteBaseWithBase", () => {
    it("strips subpath base from pathname", () => {
        expect(stripSiteBaseWithBase("/productivity/", "/productivity/docs/foo")).toBe("/docs/foo");
        expect(stripSiteBaseWithBase("/productivity/", "/productivity/")).toBe("/");
        expect(stripSiteBaseWithBase("/productivity/", "/productivity")).toBe("/");
    });

    it("leaves pathname unchanged at site root", () => {
        expect(stripSiteBaseWithBase("/", "/docs/foo")).toBe("/docs/foo");
    });
});

describe("docs route helpers", () => {
    it("detects docs app paths", () => {
        expect(isDocsAppPath("/docs/productivity")).toBe(true);
        expect(isDocsAppPath("/")).toBe(false);
    });

    it("extracts docs relative path", () => {
        expect(getDocsRelativePath("/docs/tools/ai-prompt")).toBe("tools/ai-prompt");
        expect(getDocsRelativePath(`${DOCS_ROUTE_PREFIX}/`)).toBe("");
        expect(getDocsRelativePath("/")).toBeNull();
    });
});
