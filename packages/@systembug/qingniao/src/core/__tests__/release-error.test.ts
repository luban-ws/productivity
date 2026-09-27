import { describe, expect, it, vi } from "vitest";
import { reportReleaseFailure } from "../release-error";

describe("reportReleaseFailure", () => {
    it("每次失败只输出一次完整诊断", () => {
        const output = vi.fn();
        const error = new Error("Format failed\n命令输出:\nprettier: SyntaxError");

        reportReleaseFailure(error, output);

        expect(output).toHaveBeenCalledTimes(1);
        expect(output).toHaveBeenCalledWith(
            "\nRelease failed: Format failed\n命令输出:\nprettier: SyntaxError",
        );
    });
});
