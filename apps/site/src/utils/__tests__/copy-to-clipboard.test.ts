import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AI_PROMPT_DOC_PATH, AI_PROMPT_ONE_LINER } from "../../data/ai-prompt";
import { copyToClipboard } from "../../utils/copy-to-clipboard";

describe("ai-prompt data", () => {
    it("should expose doc path and non-empty one-liner", () => {
        expect(AI_PROMPT_DOC_PATH).toBe("/docs/tools/ai-prompt");
        expect(AI_PROMPT_ONE_LINER).toContain("@systembug/pangu");
        expect(AI_PROMPT_ONE_LINER).toContain("@systembug/qingniao");
        expect(AI_PROMPT_ONE_LINER).toContain('"dev": "pangu"');
        expect(AI_PROMPT_ONE_LINER).toContain('"release": "qingniao"');
    });
});

describe("copyToClipboard", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should use navigator.clipboard when available", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });

        const ok = await copyToClipboard("hello");

        expect(ok).toBe(true);
        expect(writeText).toHaveBeenCalledWith("hello");
    });

    it("should fall back to execCommand when clipboard API fails", async () => {
        const writeText = vi.fn().mockRejectedValue(new Error("denied"));
        vi.stubGlobal("navigator", { clipboard: { writeText } });

        document.execCommand = vi.fn().mockReturnValue(true);

        const ok = await copyToClipboard("fallback");

        expect(ok).toBe(true);
        expect(document.execCommand).toHaveBeenCalledWith("copy");
    });
});
