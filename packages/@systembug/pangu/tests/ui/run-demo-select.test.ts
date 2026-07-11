/**
 * runDemoSelect 测试（mock ink render）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import type { DemoSelectAppProps } from "../../src/ui/DemoSelectApp.js";

const unmountMock = vi.fn();
const renderMock = vi.fn();

vi.mock("ink", () => ({
    render: (element: ReactElement<DemoSelectAppProps>, options?: { exitOnCtrlC?: boolean }) => {
        renderMock(element, options);
        return { unmount: unmountMock };
    },
}));

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => true,
}));

import { runDemoSelect } from "../../src/ui/run-demo-select.js";
import { DemoSelectCancelledError } from "../../src/ui/demo-select-errors.js";

const DEMOS = [
    {
        name: "Site",
        value: "site",
        description: "Site demo",
        package: "@systembug/site",
    },
];

describe("runDemoSelect", () => {
    beforeEach(() => {
        renderMock.mockClear();
        unmountMock.mockClear();
    });

    it("选择后应 resolve 并 unmount", async () => {
        renderMock.mockImplementation((element: ReactElement<DemoSelectAppProps>) => {
            Promise.resolve().then(() => {
                element.props.onSelect("site");
            });
            return { unmount: unmountMock };
        });

        await expect(runDemoSelect("Productivity", DEMOS)).resolves.toBe("site");
        expect(unmountMock).toHaveBeenCalledOnce();
    });

    it("取消时应 reject DemoSelectCancelledError", async () => {
        renderMock.mockImplementation((element: ReactElement<DemoSelectAppProps>) => {
            Promise.resolve().then(() => {
                element.props.onCancel();
            });
            return { unmount: unmountMock };
        });

        await expect(runDemoSelect("Productivity", DEMOS)).rejects.toBeInstanceOf(
            DemoSelectCancelledError,
        );
        expect(unmountMock).toHaveBeenCalledOnce();
    });

    it("应关闭 ink 默认 Ctrl+C 退出", async () => {
        renderMock.mockImplementation((element: ReactElement<DemoSelectAppProps>) => {
            Promise.resolve().then(() => {
                element.props.onSelect("site");
            });
            return { unmount: unmountMock };
        });

        await runDemoSelect("Productivity", DEMOS);

        expect(renderMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ exitOnCtrlC: false }),
        );
    });
});
