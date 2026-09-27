/**
 * UI React 组件测试
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlertApp } from "../../src/ui/AlertApp.js";
import { HelpApp } from "../../src/ui/HelpApp.js";
import { InvalidDemoScreen } from "../../src/ui/run-invalid-demo.js";
import { StartupApp } from "../../src/ui/StartupApp.js";
import { DemoSelectApp } from "../../src/ui/DemoSelectApp.js";

const DEMOS = [
    {
        name: "Site",
        value: "site",
        description: "Site demo",
        package: "@systembug/site",
    },
];

describe("UI React Components", () => {
    beforeEach(() => {
        vi.stubEnv("PANGU_LANG", "en");
    });

    describe("AlertApp", () => {
        it("应能正常渲染 AlertApp 元素", () => {
            const element = AlertApp({
                variant: "info",
                title: "ℹ️ Notice",
                lines: ["Line 1", "Line 2"],
            });
            expect(element).toBeDefined();
            expect(element.type).toBeDefined();
        });

        it("应支持无 title 渲染", () => {
            const element = AlertApp({
                variant: "error",
                lines: ["❌ Error line"],
            });
            expect(element).toBeDefined();
        });
    });

    describe("HelpApp", () => {
        it("应渲染帮助行并可控制 showWelcome", () => {
            const elementWithWelcome = HelpApp({
                lines: ["line 1", "line 2"],
                showWelcome: true,
            });
            expect(elementWithWelcome).toBeDefined();

            const elementWithoutWelcome = HelpApp({
                lines: ["line 1", "line 2"],
                showWelcome: false,
            });
            expect(elementWithoutWelcome).toBeDefined();
        });
    });

    describe("InvalidDemoScreen", () => {
        it("应渲染错误行与帮助行", () => {
            const element = InvalidDemoScreen({
                errorLine: "❌ Invalid demo: foo",
                helpLines: ["Help line 1"],
            });
            expect(element).toBeDefined();
        });
    });

    describe("StartupApp", () => {
        it("应能构建 StartupApp React 元素", () => {
            const element = React.createElement(StartupApp, {
                demoDisplayName: "Site",
                packageName: "@systembug/site",
                packageManager: "pnpm",
                command: "pnpm dev",
                resolveDirectory: () => "/workspace/site",
                readyDismissMs: 10,
                errorDismissMs: 10,
                onReady: vi.fn(),
                onError: vi.fn(),
            });
            expect(element).toBeDefined();
            expect(element.type).toBe(StartupApp);
        });
    });

    describe("DemoSelectApp", () => {
        it("应能构建 DemoSelectApp React 元素", () => {
            const element = React.createElement(DemoSelectApp, {
                supportedBy: "Productivity",
                demos: DEMOS,
                onSelect: vi.fn(),
                onCancel: vi.fn(),
            });
            expect(element).toBeDefined();
            expect(element.type).toBe(DemoSelectApp);
        });
    });
});
