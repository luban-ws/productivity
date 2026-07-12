import { describe, expect, it } from "vitest";
import {
    dedupeDocCopyBlocks,
    enhanceDocMarkedCodeBlocks,
    extractMarkdownCodeFences,
    getMarkedCodeText,
    removeOrphanMarkedShells,
} from "../enhance-doc-code-blocks";

function createMarkedCodeBlock(options: { codeAttr?: string; codeText?: string } = {}): HTMLElement {
    const block = document.createElement("wsx-marked-code");

    if (options.codeAttr) {
        block.setAttribute("code", options.codeAttr);
    }

    if (options.codeText !== undefined) {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = options.codeText;
        pre.appendChild(code);
        block.appendChild(pre);
    }

    return block;
}

function createDocCopyBlock(codeText: string): HTMLElement {
    const block = document.createElement("copy-code-block");
    block.className = "doc-copy-code-block";
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = codeText;
    pre.appendChild(code);
    block.appendChild(pre);
    return block;
}

describe("getMarkedCodeText", () => {
    it("prefers code attribute", () => {
        const block = createMarkedCodeBlock({ codeAttr: "hello", codeText: "ignored" });
        expect(getMarkedCodeText(block)).toBe("hello");
    });

    it("falls back to code element text", () => {
        const block = createMarkedCodeBlock({ codeText: "line one" });
        expect(getMarkedCodeText(block)).toBe("line one");
    });
});

describe("extractMarkdownCodeFences", () => {
    it("extracts fenced code blocks in order", () => {
        const markdown = "## One\n\n```text\nhello\n```\n\n```text\nworld\n```";
        expect(extractMarkdownCodeFences(markdown)).toEqual(["hello", "world"]);
    });
});

describe("removeOrphanMarkedShells", () => {
    it("removes empty marked when adjacent to copy block", () => {
        const root = document.createElement("div");
        root.appendChild(createDocCopyBlock("same"));
        root.appendChild(document.createElement("wsx-marked-code"));

        removeOrphanMarkedShells(root);
        expect(root.querySelector("wsx-marked-code")).toBeNull();
        expect(root.querySelector("copy-code-block")).not.toBeNull();
    });
});

describe("enhanceDocMarkedCodeBlocks", () => {
    it("uses markdown fence fallback when marked shell is empty", () => {
        const root = document.createElement("div");
        const docPage = document.createElement("wsx-doc-page");
        (docPage as { markdown?: string }).markdown = "```text\npnpm dev\n```";
        root.appendChild(docPage);
        root.appendChild(document.createElement("wsx-marked-code"));

        expect(enhanceDocMarkedCodeBlocks(root)).toBe(1);
        expect(root.querySelector("wsx-marked-code")).toBeNull();
        expect(root.querySelector("copy-code-block.doc-copy-code-block")).not.toBeNull();
    });

    it("replaces wsx-marked-code in place with copy-code-block", () => {
        const root = document.createElement("div");
        const heading = document.createElement("h2");
        heading.textContent = "section";
        const marked = createMarkedCodeBlock({ codeAttr: "pnpm dev", codeText: "pnpm dev" });
        const after = document.createElement("p");
        after.textContent = "after";

        root.appendChild(heading);
        root.appendChild(marked);
        root.appendChild(after);

        expect(enhanceDocMarkedCodeBlocks(root)).toBe(1);

        const copy = root.querySelector("copy-code-block.doc-copy-code-block");
        expect(root.querySelector("wsx-marked-code")).toBeNull();
        expect(copy).not.toBeNull();
        expect(copy?.previousElementSibling?.tagName.toLowerCase()).toBe("h2");
        expect(copy?.nextElementSibling?.tagName.toLowerCase()).toBe("p");
    });

    it("removes empty marked without fence fallback", () => {
        const root = document.createElement("div");
        root.appendChild(createMarkedCodeBlock({ codeText: "" }));

        expect(enhanceDocMarkedCodeBlocks(root)).toBe(0);
        expect(root.querySelector("wsx-marked-code")).toBeNull();
        expect(root.querySelector("copy-code-block")).toBeNull();
    });

    it("dedupes copy blocks with same text", () => {
        const root = document.createElement("div");
        root.appendChild(createDocCopyBlock("same"));
        root.appendChild(createDocCopyBlock("same"));

        dedupeDocCopyBlocks(root);
        expect(root.querySelectorAll("copy-code-block.doc-copy-code-block")).toHaveLength(1);
    });
});
