/**
 * exit-utils 测试
 */

import { describe, it, expect, vi } from "vitest";
import { exitAfterUserMessage } from "../src/exit-utils.js";

describe("exitAfterUserMessage", () => {
    it("应以 0 退出", () => {
        const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

        exitAfterUserMessage();

        expect(exitSpy).toHaveBeenCalledWith(0);
        exitSpy.mockRestore();
    });
});
