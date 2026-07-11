/**
 * tty 检测测试
 */

import { describe, it, expect, afterEach } from "vitest";
import { isInteractiveTerminal } from "../../src/ui/tty.js";

describe("isInteractiveTerminal", () => {
    const originalStdin = process.stdin.isTTY;
    const originalStdout = process.stdout.isTTY;

    afterEach(() => {
        Object.defineProperty(process.stdin, "isTTY", {
            value: originalStdin,
            configurable: true,
        });
        Object.defineProperty(process.stdout, "isTTY", {
            value: originalStdout,
            configurable: true,
        });
    });

    it("stdin 与 stdout 均为 TTY 时应为 true", () => {
        Object.defineProperty(process.stdin, "isTTY", { value: true, configurable: true });
        Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });

        expect(isInteractiveTerminal()).toBe(true);
    });

    it("stdin 非 TTY 时应为 false", () => {
        Object.defineProperty(process.stdin, "isTTY", { value: false, configurable: true });
        Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });

        expect(isInteractiveTerminal()).toBe(false);
    });
});
