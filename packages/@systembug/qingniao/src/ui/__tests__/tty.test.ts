/**
 * TTY 检测测试
 */

import { afterEach, describe, expect, it } from "vitest";
import { isInteractiveTerminal } from "../tty";

function mockTty(
    stdin: boolean | undefined,
    stdout: boolean | undefined,
): () => void {
    const originalStdin = process.stdin.isTTY;
    const originalStdout = process.stdout.isTTY;
    Object.defineProperty(process.stdin, "isTTY", { value: stdin, configurable: true });
    Object.defineProperty(process.stdout, "isTTY", { value: stdout, configurable: true });
    return () => {
        Object.defineProperty(process.stdin, "isTTY", {
            value: originalStdin,
            configurable: true,
        });
        Object.defineProperty(process.stdout, "isTTY", {
            value: originalStdout,
            configurable: true,
        });
    };
}

describe("isInteractiveTerminal", () => {
    let restore: (() => void) | undefined;

    afterEach(() => {
        restore?.();
        restore = undefined;
    });

    it("stdin/stdout 均为 TTY 时返回 true", () => {
        restore = mockTty(true, true);
        expect(isInteractiveTerminal()).toBe(true);
    });

    it("非 TTY 时返回 false", () => {
        restore = mockTty(undefined, true);
        expect(isInteractiveTerminal()).toBe(false);
    });
});
